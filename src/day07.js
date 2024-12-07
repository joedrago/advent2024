fs = require("fs")

// const debug = console.log
const debug = () => {}

const isSolvable = (availableOps, goal, vals) => {
    const OP_FIRST = 0
    const OP_LAST = availableOps.length - 1

    const opCount = vals.length - 1
    let ops = []
    for (let i = 0; i < opCount; ++i) {
        ops.push(OP_FIRST)
    }

    for (;;) {
        let attempt = vals[0]
        let equation = `${attempt}`
        for (let i = 1; i < vals.length; ++i) {
            const v = vals[i]
            const op = availableOps[ops[i - 1]]
            equation += ` ${op} ${v}`
            switch (op) {
                case "+":
                    attempt += v
                    break
                case "*":
                    attempt *= v
                    break
                case "||":
                    attempt = parseInt(`${attempt}${v}`)
                    break
            }
        }
        debug(`Attempt[${goal}]: ${equation} = ${attempt}`)
        if (attempt > goal) {
            debug(`Attempt[${goal}]: Unsolvable (too big)`)
            return false
        }
        if (attempt == goal) {
            debug(`Attempt[${goal}]: Solvable`)
            return true
        }

        // See if this is our final attempt
        let done = true
        for (let i = 0; i < opCount; ++i) {
            if (ops[i] != OP_LAST) {
                done = false
                break
            }
        }
        if (done) {
            break
        }

        // "Increment" the set of operators
        for (let i = 0; i < opCount; ++i) {
            if (ops[i] < OP_LAST) {
                ops[i] += 1
                break
            } else {
                ops[i] = OP_FIRST
            }
        }
    }

    debug(`Attempt[${goal}]: Unsolvable (exhaustive)`)
    return false
}

const main = async (argv) => {
    const inputFilename = argv.shift()
    if (!inputFilename) {
        console.error("Syntax: day07 [input.txt]")
        return
    }

    const opsP1 = ["+", "*"]
    const opsP2 = ["+", "*", "||"]

    let sumP1 = 0
    let sumP2 = 0
    const lines = fs.readFileSync(inputFilename, "utf8").replace(/\r/g, "").split(/\n/)
    for (let line of lines) {
        const outer = line.split(/:/)
        if (outer.length != 2) {
            continue
        }
        const goal = parseInt(outer[0])
        const vals = outer[1]
            .split(/\s+/)
            .filter((e) => e.length > 0)
            .map((e) => parseInt(e))

        if (isSolvable(opsP1, goal, vals)) {
            sumP1 += goal
        }

        if (isSolvable(opsP2, goal, vals)) {
            sumP2 += goal
        }
    }

    console.log(`P1 Sum: ${sumP1}`)
    console.log(`P2 Sum: ${sumP2}`)
}

main(process.argv.slice(2))
