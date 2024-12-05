fs = require("fs")

// const debug = console.log
const debug = () => {}

const isReportSafe = (report, skipIndex = null) => {
    let prev = null
    let expectingIncreasing = null
    const count = report.length
    for (let i = 0; i < count; ++i) {
        const curr = report[i]

        if (skipIndex == i) {
            debug(report, `dampening(${skipIndex}) => ${curr}`)
            continue
        }

        if (prev != null) {
            if (expectingIncreasing == null) {
                expectingIncreasing = prev < curr
                debug(report, `expectingIncreasing: ${expectingIncreasing}`)
            } else {
                isIncreasing = prev < curr
                if (isIncreasing != expectingIncreasing) {
                    debug(report, `Unsafe: isIncreasing(${isIncreasing}) != expectingIncreasing(${expectingIncreasing})`)
                    return false
                }
            }

            const diff = Math.abs(prev - curr)
            if (diff < 1 || diff > 3) {
                debug(report, `Unsafe: diff(${diff})`)
                return false
            }
        }

        prev = curr
    }

    if (skipIndex == null) {
        debug(report, `Safe`)
    } else {
        debug(report, `Safe (dampened)`)
    }
    return true
}

const isDampenedReportSafe = (report) => {
    debug(report, "Dampening...")

    const count = report.length
    for (let i = 0; i < count; ++i) {
        if (isReportSafe(report, i)) {
            return true
        }
    }

    debug(report, `Unsafe, even dampened`)
    return false
}

const main = async (argv) => {
    const inputFilename = argv.shift()
    if (!inputFilename) {
        console.error("Syntax: day02 [input.txt]")
        return
    }

    const lines = fs
        .readFileSync(inputFilename, "utf8")
        .split(/[\r\n]/)
        .filter((line) => line.length > 0)

    let safeCount = 0
    let dampenedSafeCount = 0
    let totalCount = 0
    for (let line of lines) {
        debug(`-- ${line} --`)
        if (line.length < 1) {
            continue
        }

        const report = line.split(/\s+/).map((e) => parseInt(e))
        if (isReportSafe(report)) {
            ++safeCount
        } else if (isDampenedReportSafe(report)) {
            ++dampenedSafeCount
        }
        ++totalCount
    }

    console.log(`Safe (basic)   : ${safeCount}`)
    console.log(`Safe (dampened): ${dampenedSafeCount}`)
    console.log(`Safe (combined): ${safeCount + dampenedSafeCount}`)
    console.log(`Total          : ${totalCount}`)
}

main(process.argv.slice(2))
