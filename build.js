const fs = require('fs');
const path = require('path');
const argparse = require('argparse');
const httpServer = require('http-server');
const pdfRenderer = require('chrome-headless-render-pdf');

/* Configuration */
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
const configTemp = 'config-temp.json';
const serverPort = 8123;

/* Arguments */
var parser = new argparse.ArgumentParser({
    version: '1.0.0',
    description: 'Build script to generate PDF invoices.',
    addHelp: true
});
parser.addArgument(['-c', '--config'], {
    help: 'Configuration JSON file for the invoice template.',
    required: true
});
parser.addArgument(['-l', '--language'], {
    help: 'Invoice language as ISO 3166-1 alpha-2 codes.',
    defaultValue: 'en'
});
parser.addArgument(['-o', '--output'], {
    help: 'Output PDF file to be generated.',
});
parser.addArgument(['input'], {
    help: 'Input HTML file to be processed.',
});

var args = parser.parseArgs();
if (typeof something === "undefined") {
    args.output = `build/invoice-${args.language}.pdf`;
}
var invoiceRootRel = path.dirname(args.input);
var invoiceRootAbs = path.resolve(invoiceRootRel);
var invoiceConfigTempPath = path.join(invoiceRootAbs, configTemp);
var invoiceConfigPath = path.join(path.relative(invoiceRootRel, '.'), args.config).replace('\\', '/');
var invoiceConfigData = JSON.stringify({
    parent: invoiceConfigPath,
    language: args.language,
});
fs.writeFileSync(invoiceConfigTempPath, invoiceConfigData); 

/* Server */
console.log(`Serving: ${invoiceRootAbs}`);
var server = httpServer.createServer({
    root: invoiceRootAbs
});
server.listen(serverPort);

/* Rendering */
var url = `http://localhost:${serverPort}/${args.input}`
console.log(`Target: ${url}`)
console.log(`Generating: ${args.output}`);
pdfRenderer.generateSinglePdf(url, args.output, {
    chromeBinary: chromePath
}).then(() => {
    console.log('Success!');
    process.exit();
});
