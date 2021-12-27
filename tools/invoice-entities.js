const argparse = require('argparse');
const { loadConfiguration, deepEqual } = require('./common');

// Declare arguments
var parser = new argparse.ArgumentParser({
    version: '1.0.0',
    description: 'Identify unique entities',
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
let entities = [];
for (const config of configs) {
    if (entities.some(entity => deepEqual(entity, config.company))) {
        continue;
    }
    entities.push(config.company);
}
console.log(entities);
