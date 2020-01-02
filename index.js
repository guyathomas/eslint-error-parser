const fs = require('fs');

const regexMatchers = {
    filePath: /\/.*\/.*/,
    logLine: /\W+(\d+):(\d+)\W+(error|warning) +.* (((.*)\/)?(.*))$/
}

// Return null if no line / empty string, otherwise the 
const findRegexForLine = (line) => {
    if (!line) { return null }
    const regexMatchersTuples = Object.entries(regexMatchers);
    const matchingRegex = regexMatchersTuples.find(([regexTitle, regex]) => regex.test(line));
    return matchingRegex ? matchingRegex[0] : 'unknown'
}

const createStructuredLog = () => {
    const log = fs.readFileSync('./test.txt', 'utf-8');
    const logLines = log.split('\n');

    const result = logLines.map((line) => {
        const regexType = findRegexForLine(line);
        if (regexType != 'logLine') return;
        const result = line.match(regexMatchers[regexType])
        if (!result) return;
        const [
            _,
            errorLine,
            errorColumn,
            type,
            rule,
            __,
            ruleModule,
            ruleName
        ] = result;
        return { errorLine, errorColumn, type, rule, ruleModule, ruleName };
    }).filter(result => !!result);
    return result;
}

const createFreqFromLog = (structuredLog) => {
    const freqObj = structuredLog.reduce((acc, line) => {
        acc[line.rule] ? acc[line.rule]++ : acc[line.rule] = 1
        return acc;
    }, {});
    // Sort the order in the object. Add complexity but better printing of results
    return Object.entries(freqObj).sort(([_, freq1], [__, freq2]) => freq2 - freq1).reduce((acc, [ key, value ]) => ({ ...acc, [key]: value }), {})
}

const filterESLint = () => {
    const structuredLog = createStructuredLog();
    const log = structuredLog.filter(line => line.type === 'error')

    return createFreqFromLog(log);
}

console.log(filterESLint());