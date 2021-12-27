const argparse = require('argparse');
const { loadConfiguration, deepEqual } = require('./common');

// Declare arguments
var parser = new argparse.ArgumentParser({
    version: '1.0.0',
    description: 'Identify unique clients',
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
let clients = [];
for (const config of configs) {
    if (clients.some(client => deepEqual(client, config.client))) {
        continue;
    }
    clients.push(config.client);
}
console.log(JSON.stringify(clients));
