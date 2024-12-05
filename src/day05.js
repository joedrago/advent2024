fs = require("fs")

// const debug = console.log
const debug = () => {}

class Rules {
    constructor() {
        this.unprintableRules = {}
    }

    add(beforePage, afterPage) {
        // If I see afterPage, I can never see beforePage for the rest of this update
        if (!this.unprintableRules[afterPage]) {
            this.unprintableRules[afterPage] = []
        }
        this.unprintableRules[afterPage].push(beforePage)
    }

    legal(updatePages) {
        const unprintable = {}
        for (let updatePage of updatePages) {
            if (unprintable[updatePage]) {
                return false
            }

            if (this.unprintableRules[updatePage]) {
                for (let badPage of this.unprintableRules[updatePage]) {
                    unprintable[badPage] = true
                }
            }
        }
        return true
    }
}

const main = async (argv) => {
    const inputFilename = argv.shift()
    if (!inputFilename) {
        console.error("Syntax: day05 [input.txt]")
        return
    }

    const rules = new Rules()
    let middleSumP1 = 0
    let middleSumP2 = 0

    const lines = fs.readFileSync(inputFilename, "utf8").replace(/\r/g, "").split(/\n/)
    let parsingRules = true
    for (let line of lines) {
        if (parsingRules) {
            if (line.length == 0) {
                // Move onto parsing rules

                parsingRules = false
            } else {
                // Parse Rules

                const pieces = line.split(/\|/)
                if (pieces.length == 2) {
                    const beforePage = parseInt(pieces[0])
                    const afterPage = parseInt(pieces[1])
                    rules.add(beforePage, afterPage)
                }
            }
        } else {
            if (line.length == 0) {
                // no more updates

                break
            } else {
                // Parse Updates

                updatePages = line.split(/,/).map((e) => parseInt(e))

                // Phase 1: count the middle sum if ordered correctly already
                const alreadyCorrect = rules.legal(updatePages)
                if (alreadyCorrect) {
                    const middleIndex = Math.floor(updatePages.length / 2)
                    const middlePage = updatePages[middleIndex]
                    middleSumP1 += middlePage
                }

                // Phase 2: Order the pages correctly based on the rules
                let correctedPages = []
                for (let updatePage of updatePages) {
                    for (let insertIndex = correctedPages.length; insertIndex >= 0; --insertIndex) {
                        const attempt = []
                        for (let p of correctedPages) {
                            attempt.push(p)
                        }
                        attempt.splice(insertIndex, 0, updatePage)
                        if (rules.legal(attempt)) {
                            correctedPages = attempt
                            break
                        }
                    }
                }

                const middleIndex = Math.floor(correctedPages.length / 2)
                const middlePage = correctedPages[middleIndex]
                if (!alreadyCorrect) {
                    // only count the middle sum in Phase 2 if they were originally bad
                    middleSumP2 += middlePage
                }
            }
        }
    }

    console.log(`P1 Middle Sum: ${middleSumP1}`)
    console.log(`P2 Middle Sum: ${middleSumP2}`)
}

main(process.argv.slice(2))
