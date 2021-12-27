const fs = require('fs');
var path = require("path");

function isObject(object) {
    return object != null && typeof object === 'object';
}

function deepEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if (areObjects && !deepEqual(val1, val2) || !areObjects && val1 !== val2) {
            return false;
        }
    }
    return true;
}

function loadConfiguration(configPath) {
    let config = {};
    let loaded = [];
    configPath = path.resolve(configPath);
    while (configPath) {
        if (loaded.includes(configPath)) {
            console.error(`Configuration file already processed: ${path}`);
            break;
        }
        loaded.push(configPath);
        const c = JSON.parse(fs.readFileSync(configPath));
        config = Object.assign({}, config, c);
        if (typeof c.parent === "undefined") {
            break;
        }
        configPath = path.resolve(configPath, '..', c.parent);
    }
    return config;
}

module.exports = {
    loadConfiguration, deepEqual
}
