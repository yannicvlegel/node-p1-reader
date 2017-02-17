var fs = require('fs');
var config = require('../config/config.json');
var debugMode = false;

/**
 * Set the debug mode
 *
 * @param mode : Debug mode boolean
 */
function setDebugMode(mode) {
    debugMode = mode || false;

    if (debugMode) {
        console.log('DEBUG MODE ACTIVE');
    }
}

/**
 * Write raw and parsed data to log file for debugging purposes
 *
 * @param packet : P1 packet according to DSMR4.0 specification
 */
function writeToLogFile(rawPacket, parsedPacket) {
    if (!debugMode) { return; }

    var now = new Date().toUTCString();

    fs.appendFile(config.debugRawDataFile, 'Package received at ' + now + ':\n' + rawPacket + '\n\n', function (err) {
        if (err) {
            console.error('Could not write raw package to ' + config.debugRawDataFile);
        }
    });

    fs.appendFile(config.debugParsedDataFile, 'Package received at ' + now + ':\n' + JSON.stringify(parsedPacket, true, 4) + '\n\n', function (err) {
        if (err) {
            console.error('Could not write parsed package to ' + config.debugParsedDataFile);
        }
    });
}

/**
 * Print list of available ports to log
 */
function logAvailablePorts(ports) {
    if (!debugMode) { return; }

    console.log('Available ports: \n' + JSON.stringify(ports, true, 4));
}

module.exports.setDebugMode = setDebugMode;
module.exports.writeToLogFile = writeToLogFile;
module.exports.logAvailablePorts = logAvailablePorts;