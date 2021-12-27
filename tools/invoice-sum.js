const argparse = require('argparse');
const assert = require('assert');
const { loadConfiguration } = require('./common');

// Declare arguments
var parser = new argparse.ArgumentParser({
    version: '1.0.0',
    description: 'Sum invoice totals',
    addHelp: true
});
parser.addArgument('configs', {
    help: 'Configuration JSON files to process.',
    metavar: 'config.json',
    nargs: '+'
});

// Process invoice data
const args = parser.parseArgs();
const configs = args.configs.map(loadConfiguration);
let totals = {};
for (const config of configs) {
    let total = 0;
    for (const project of config.projects) {
        total += project.amount;
    }
    assert(config.currencySrc == config.currencyDest,
        "Currency conversions not supported while adding invoices"); // TODO
    totals[config.currencyDest] = totals[config.currencyDest] || 0;
    totals[config.currencyDest] += total;
}
console.log(totals);
