const { lstatSync } = require("fs")

fs = require("fs")

const debug = console.log
// const debug = () => {}

const NORTH = 0
const EAST = 1
const SOUTH = 2
const WEST = 3

const GUARD_SHAPE_TO_DIR = {
    "^": NORTH,
    ">": EAST,
    v: SOUTH,
    "<": WEST
}
const GUARD_DIR_TO_SHAPE = {}
for (let k in GUARD_SHAPE_TO_DIR) {
    const v = GUARD_SHAPE_TO_DIR[k]
    GUARD_DIR_TO_SHAPE[v] = k
}

const dirName = (dir) => {
    switch (dir) {
        case NORTH:
            return "N"
        case EAST:
            return "E"
        case SOUTH:
            return "S"
        case WEST:
            return "W"
    }
}

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

const color = (text, color) => {
    let s = "\x1b["
    if (color.length > 1) {
        s += "1;"
        color = color.substring(1)
    }
    const VALS = { r: 31, g: 32, y: 33, b: 34, m: 35, c: 36, w: 37 }
    let colorVal = VALS[color] != undefined ? VALS[color] : "37"
    s += `${colorVal}m${text}\x1b[0m`
    return s
}

class Grid {
    constructor(rawGrid) {
        const gridLookup = rawGrid.replace(/\n/g, "")
        this.w = rawGrid.indexOf("\n")
        this.h = Math.floor(gridLookup.length / this.w)
        if (this.w * this.h != gridLookup.length) {
            console.error("Failed to read grid!")
            process.exit(1)
        }

        this.grid = []
        for (let y = 0; y < this.h; ++y) {
            for (let x = 0; x < this.w; ++x) {
                const rawCell = gridLookup[this.w * y + x]
                const cell = {
                    wall: false,
                    visited: 0
                }
                if (rawCell == "#") {
                    cell.wall = true
                } else if (GUARD_SHAPE_TO_DIR[rawCell] != undefined) {
                    this.startDir = GUARD_SHAPE_TO_DIR[rawCell]
                    this.startX = x
                    this.startY = y
                }
                this.grid.push(cell)
            }
        }

        this.reset()
    }

    reset(fakeX, fakeY) {
        this.fakeX = fakeX
        this.fakeY = fakeY
        this.x = this.startX
        this.y = this.startY
        this.dir = this.startDir

        for (let cell of this.grid) {
            cell.visited = 0
        }
        this.visit()
    }

    print() {
        debug(`Grid[${this.w}x${this.h}]: Guard at (${this.x},${this.y}), facing ${dirName(this.dir)}`)

        for (let y = 0; y < this.h; ++y) {
            let row = ""
            for (let x = 0; x < this.w; ++x) {
                const cell = this.grid[this.w * y + x]
                let c = color(".", "b")
                if (x == this.x && y == this.y) {
                    c = color(GUARD_DIR_TO_SHAPE[this.dir], "bm")
                } else if (cell.wall) {
                    c = color("#", "by")
                } else if (cell.visited) {
                    c = color("X", "g")
                }
                row += c
            }
            debug(row)
        }
    }

    cell(x, y) {
        return this.grid[this.w * y + x]
    }

    visit() {
        this.cell(this.x, this.y).visited |= 1 << this.dir
    }

    visitCount() {
        let count = 0
        for (let cell of this.grid) {
            if (cell.visited > 0) {
                count += 1
            }
        }
        return count
    }

    step() {
        let dx = 0
        let dy = 0
        switch (this.dir) {
            case NORTH:
                dx = 0
                dy = -1
                break
            case EAST:
                dx = 1
                dy = 0
                break
            case SOUTH:
                dx = 0
                dy = 1
                break
            case WEST:
                dx = -1
                dy = 0
                break
        }

        let newX = this.x + dx
        let newY = this.y + dy
        if (newX < 0 || newY < 0 || newX >= this.w || newY >= this.h) {
            // We've left the map
            return "escape"
        }

        let action = ""
        const newCell = this.cell(newX, newY)
        if (this.fakeX != undefined && this.fakeY != undefined && this.fakeX == newX && this.fakeY == newY) {
            action = "faketurn"
            this.dir = (this.dir + 1) % 4
        } else if (newCell.wall) {
            action = "turn"
            this.dir = (this.dir + 1) % 4
        } else {
            action = "step"
            this.x = newX
            this.y = newY
        }

        if ((this.cell(this.x, this.y).visited & (1 << this.dir)) != 0) {
            action = "loop"
        }

        this.visit()
        return action
    }

    run(fakeX, fakeY) {
        this.reset(fakeX, fakeY)
        let lastAction = ""
        while (lastAction != "escape" && lastAction != "loop") {
            lastAction = this.step()
        }
        return lastAction
    }

    countLoops() {
        let count = 0
        for (let y = 0; y < this.h; ++y) {
            for (let x = 0; x < this.w; ++x) {
                if (this.startX == x && this.startY == y) {
                    // You may not place an obstruction on the guard
                    continue
                }
                const action = this.run(x, y)
                if (action == "loop") {
                    debug(`Loop Obstacle: ${x},${y}`)
                    count += 1
                }
            }
        }
        return count
    }
}

const main = async (argv) => {
    const inputFilename = argv.shift()
    if (!inputFilename) {
        console.error("Syntax: day06 [input.txt]")
        return
    }

    const grid = new Grid(fs.readFileSync(inputFilename, "utf8").replace(/\r/g, ""))

    // -- Fun Anims --
    // while (grid.step() != "escape") {
    //     process.stdout.cursorTo(0, 0)
    //     grid.print()
    //     await sleep(10)
    // }

    // -- Phase 1 --
    grid.run()
    debug(`Phase 1: ${grid.visitCount()}`)

    // -- Phase 2 --
    debug(`Phase 2: ${grid.countLoops()}`)
}

main(process.argv.slice(2))
