fs = require("fs")

// const debug = console.log
const debug = () => {}

// Regex magic
const findMulsRegex = (mem) => {
    debug(`-- [Regex] ${mem} --`)
    let matches = null
    const regex = /mul\((\d+),(\d+)\)/g
    let sum = 0
    while ((matches = regex.exec(mem)) != null) {
        const a = parseInt(matches[1])
        const b = parseInt(matches[2])
        debug(`Found: mul(${a},${b})`)

        sum += a * b
    }
    return sum
}

// Use an actual parsing state machine
const findMulsParse = (mem) => {
    debug(`-- [Parse] ${mem} --`)
    let state = "mul"
    let index = 0
    let charCode0 = "0".charCodeAt(0)
    let charCode9 = "9".charCodeAt(0)
    let charCodeComma = ",".charCodeAt(0)
    let charCodeClose = ")".charCodeAt(0)
    let vals = {
        a: null,
        b: null
    }
    let sum = 0
    while (index < mem.length) {
        switch (state) {
            case "mul": {
                if (mem.substr(index, 4) == "mul(") {
                    debug(`BEGIN mul(${index})`)
                    state = "a"
                    index = index + 4
                    vals.a = null
                    vals.b = null
                } else {
                    ++index
                }
                break
            }

            case "a":
            case "b": {
                const c = mem.charCodeAt(index)
                if (c >= charCode0 && c <= charCode9) {
                    if (vals[state] == null) {
                        vals[state] = 0
                    }
                    vals[state] = vals[state] * 10 + c - charCode0
                    debug(`${state} is now ${vals[state]}`)
                } else if (c == charCodeComma) {
                    if (state == "a" && vals.a != null) {
                        state = "b"
                    } else {
                        state = "mul"
                    }
                } else if (c == charCodeClose) {
                    if (state == "b" && vals.b != null) {
                        state = "b"
                        debug(`END MUL ${vals.a} ${vals.b}`)
                        sum += vals.a * vals.b
                    }
                    state = "mul"
                    vals.a = null
                    vals.b = null
                } else {
                    state = "mul"
                }
                ++index
                break
            }

            default: {
                ++index
            }
        }
    }

    return sum
}

// Just do a bunch of splits!
const findMulsSplit = (mem) => {
    debug(`-- [Split] ${mem} --`)

    let sum = 0

    const mulSections = mem.split(/mul\(/)
    for (let mulSection of mulSections) {
        const parenSections = mulSection.split(/\)/)
        if (parenSections.length > 1) {
            const intSections = parenSections[0].split(/,/)
            if (intSections.length == 2) {
                const a = parseInt(intSections[0])
                const b = parseInt(intSections[1])
                if (intSections[0] == `${a}` && intSections[1] == `${b}`) {
                    sum += a * b
                }
            }
        }
    }

    return sum
}

// Be lazy and do splits for do/dont logic, but use any summing routine
const findMulsDont = (mem, sumFunc) => {
    let sum = 0
    let enabled = true
    let first = true

    const doSections = mem.split(/do/)
    for (const doSection of doSections) {
        if (doSection.indexOf("()") == 0) {
            enabled = true
        } else if (!first && doSection.indexOf("n't()") == 0) {
            enabled = false
        }
        if (enabled) {
            sum += sumFunc(doSection)
        }
        first = false
    }

    return sum
}

const main = async (argv) => {
    const inputFilename = argv.shift()
    if (!inputFilename) {
        console.error("Syntax: day3 [input.txt]")
        return
    }

    const mem = fs.readFileSync(inputFilename, "utf8")

    console.log(`Phase1[Regex]: ${findMulsRegex(mem)}`)
    console.log(`Phase1[Parse]: ${findMulsParse(mem)}`)
    console.log(`Phase1[Split]: ${findMulsSplit(mem)}`)

    console.log(`Phase2[Regex]: ${findMulsDont(mem, findMulsRegex)}`)
    console.log(`Phase2[Parse]: ${findMulsDont(mem, findMulsParse)}`)
    console.log(`Phase2[Split]: ${findMulsDont(mem, findMulsSplit)}`)
}

main(process.argv.slice(2))
