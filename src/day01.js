fs = require("fs")

const main = async (argv) => {
    const inputFilename = argv.shift()
    if (!inputFilename) {
        console.error("Syntax: day1 [input.txt]")
        return
    }

    const lines = fs
        .readFileSync(inputFilename, "utf8")
        .split(/[\r\n]/)
        .filter((line) => line.length > 0)

    const listL = []
    const listR = []
    const countR = {}
    for (const line of lines) {
        const pieces = line.split(/\s+/)
        if (pieces.length != 2) {
            continue
        }

        const l = parseInt(pieces[0])
        listL.push(l)
        const r = parseInt(pieces[1])
        listR.push(r)

        if (!countR[r]) {
            countR[r] = 0
        }
        ++countR[r]
    }
    listL.sort()
    listR.sort()

    let totalDistance = 0
    let similarityScore = 0
    for (let i = 0; i < listL.length; ++i) {
        const l = listL[i]
        const r = listR[i]

        const diff = Math.abs(l - r)
        totalDistance += diff

        if (countR[l]) {
            similarityScore += l * countR[l]
        }
    }

    console.log(`Total Distance  : ${totalDistance}`)
    console.log(`Similarity Score: ${similarityScore}`)
}

main(process.argv.slice(2))
