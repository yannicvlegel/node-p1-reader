var P1Reader = require('../main');
var fs = require('fs');

var config = {};

// Enable Debug Mode by uncommenting the line below
// config.debug = true;

// Force a specific serial port (instead of auto discovery) by uncommenting the line below
// config.serialPort = '/dev/tty-usbserial1';

// Enable Emulator Mode by uncommenting the line below
// config.electricityOffset = 100;
// config.electricityIncrement = 10;
// config.gasOffset = 50;
// config.gasIncrement = 5;

var p1Reader = new P1Reader(config);

p1Reader.on('connected', function(port) {
    console.log('Connection with the Smart Meter has been established on port: ' + port);
});

p1Reader.on('reading', function(data) {
    console.log('Reading received: currently consuming ' + data.electricity.received.actual.reading + data.electricity.received.actual.unit);

    // Write electricity totals and actual value to CSV
    var csvOutput = '' +
        data.timestamp + ';' +
        data.electricity.received.tariff1.reading + ';' +
        data.electricity.received.tariff2.reading + ';' +
        data.electricity.received.actual.reading + ';' +
        data.electricity.tariffIndicator + ';' +
        data.electricity.numberOfPowerFailures + ';' +
        data.electricity.numberOfLongPowerFailures + ';' +
        data.gas.timestamp + ';' +
        data.gas.reading + '\n';

    fs.appendFile('p1-reader-log.csv', csvOutput);
});

p1Reader.on('error', function(error) {
    console.log(error);
});

p1Reader.on('close', function() {
    console.log('Connection closed');
});

// Handle all uncaught errors without crashing
process.on('uncaughtException', function(error) {
    console.error(error);
});