var P1Reader = require('../main');
var fs = require('fs');

var p1Reader = new P1Reader({debug: true});

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

p1Reader.on('error', function(data) {
    console.log('Error while reading: ' + data);
});

p1Reader.on('close', function() {
    console.log('Connection closed');
});

// Handle all uncaught errors without crashing
process.on('uncaughtException', function(err) {
    console.error( err );
});