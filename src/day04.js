fs = require("fs")

// const debug = console.log
const debug = () => {}

class Grid {
    constructor(rawGrid) {
        this.grid = rawGrid.replace(/\n/g, "")
        this.w = rawGrid.indexOf("\n")
        this.h = Math.floor(this.grid.length / this.w)
        if (this.w * this.h != this.grid.length) {
            console.error("Failed to read grid!")
            process.exit(1)
        }
    }

    cell(x, y) {
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) {
            // Return somehing not XMAS-like
            return " "
        }
        return this.grid[this.w * y + x]
    }

    xmasFromCell(x, y) {
        if (this.cell(x, y) != "X") {
            return 0
        }

        let count = 0

        // Check all 8 directions for MAS
        for (let dx = -1; dx < 2; ++dx) {
            for (let dy = -1; dy < 2; ++dy) {
                if (!dx && !dy) {
                    continue
                }

                if (this.cell(dx * 1 + x, dy * 1 + y) != "M") {
                    continue
                }
                if (this.cell(dx * 2 + x, dy * 2 + y) != "A") {
                    continue
                }
                if (this.cell(dx * 3 + x, dy * 3 + y) != "S") {
                    continue
                }

                ++count
            }
        }

        return count
    }

    xmasCount() {
        let count = 0
        for (let y = 0; y < this.h; ++y) {
            for (let x = 0; x < this.w; ++x) {
                count += this.xmasFromCell(x, y)
            }
        }
        return count
    }

    dashmasFromCell(x, y) {
        if (this.cell(x, y) != "A") {
            return 0
        }

        const tl = this.cell(x - 1, y - 1)
        const tr = this.cell(x + 1, y - 1)
        const bl = this.cell(x - 1, y + 1)
        const br = this.cell(x + 1, y + 1)

        if ((tr == "M" && bl == "S") || (tr == "S" && bl == "M")) {
            // positive diagonal is good
            if ((tl == "M" && br == "S") || (tl == "S" && br == "M")) {
                // negative diagonal is good
                return 1
            }
        }

        return 0
    }

    dashmasCount() {
        let count = 0
        for (let y = 0; y < this.h; ++y) {
            for (let x = 0; x < this.w; ++x) {
                count += this.dashmasFromCell(x, y)
            }
        }
        return count
    }
}

const main = async (argv) => {
    const inputFilename = argv.shift()
    if (!inputFilename) {
        console.error("Syntax: day04 [input.txt]")
        return
    }

    const grid = new Grid(fs.readFileSync(inputFilename, "utf8").replace(/\r/g, ""))
    console.log(`Grid Size  : ${grid.w}x${grid.h}`)
    console.log(`XMAS Count : ${grid.xmasCount()}`)
    console.log(`X-MAS Count: ${grid.dashmasCount()}`)
}

main(process.argv.slice(2))
