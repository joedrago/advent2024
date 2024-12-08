fs = require("fs")

const debug = console.log
// const debug = () => {}

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
        this.antennae = {}
        for (let y = 0; y < this.h; ++y) {
            for (let x = 0; x < this.w; ++x) {
                const rawCell = gridLookup[this.w * y + x]
                const cell = {
                    antenna: null,
                    antinode: false
                }
                if (rawCell != ".") {
                    cell.antenna = rawCell
                    if (this.antennae[cell.antenna] == undefined) {
                        this.antennae[cell.antenna] = []
                    }
                    this.antennae[cell.antenna].push({ x, y })
                }
                this.grid.push(cell)
            }
        }
    }

    print(title) {
        debug(`Grid[${this.w}x${this.h}]: ${title}`)

        for (let y = 0; y < this.h; ++y) {
            let row = ""
            for (let x = 0; x < this.w; ++x) {
                const cell = this.grid[this.w * y + x]
                let char = "."
                let charColor = "b"
                if (cell.antinode) {
                    char = "#"
                }
                if (cell.antenna != null) {
                    char = cell.antenna
                    charColor = "by"
                }
                if (cell.antinode) {
                    charColor = "g"
                }
                row += color(char, charColor)
            }
            debug(row)
        }
    }

    cell(x, y) {
        return this.grid[this.w * y + x]
    }

    resetAntinodes() {
        for (let cell of this.grid) {
            cell.antinode = false
        }
    }

    findAntinodes(infiniteAntinodes) {
        this.resetAntinodes()

        let antinodeCount = 0
        for (let antenna in this.antennae) {
            const antList = this.antennae[antenna]
            const antCount = antList.length
            for (let i = 0; i < antCount - 1; ++i) {
                for (let j = i + 1; j < antCount; ++j) {
                    const a = antList[i]
                    const b = antList[j]
                    const dx = b.x - a.x
                    const dy = b.y - a.y

                    let rays = []
                    rays.push({ x: a.x, y: a.y, dx: dx, dy: dy })
                    rays.push({ x: b.x, y: b.y, dx: -dx, dy: -dy })

                    for (let ray of rays) {
                        let antinodeX = ray.x
                        let antinodeY = ray.y

                        for (;;) {
                            if (infiniteAntinodes) {
                                // shoot the ray towards the other node to mark it and any antinodes between
                                antinodeX += ray.dx
                                antinodeY += ray.dy
                            } else {
                                // shoot the ray away from the other node to simply add up to one antinode per antenna
                                antinodeX -= ray.dx
                                antinodeY -= ray.dy
                            }

                            if (antinodeX < 0 || antinodeX >= this.w || antinodeY < 0 || antinodeY >= this.h) {
                                break
                            }

                            const antinodeCell = this.cell(antinodeX, antinodeY)
                            if (!antinodeCell.antinode) {
                                antinodeCell.antinode = true
                                antinodeCount += 1
                            }

                            if (!infiniteAntinodes) {
                                // We're in phase 1, bail out here
                                break
                            }
                        }
                    }
                }
            }
        }
        return antinodeCount
    }
}

const main = async (argv) => {
    const inputFilename = argv.shift()
    if (!inputFilename) {
        console.error("Syntax: day08 [input.txt]")
        return
    }

    const grid = new Grid(fs.readFileSync(inputFilename, "utf8").replace(/\r/g, ""))
    grid.print("Input")
    const antinodeCountP1 = grid.findAntinodes(false)
    grid.print("Phase 1")
    console.log(antinodeCountP1)
    const antinodeCountP2 = grid.findAntinodes(true)
    grid.print("Phase 2")
    console.log(antinodeCountP2)
}

main(process.argv.slice(2))
