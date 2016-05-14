var EventEmitter = require('events');
var util = require('util');
var fs = require('fs');
var SerialPort = require('serialport').SerialPort;

var parsePacket = require('./src/parsePacket');
var config = require('./config/config.json');

function P1Reader(port, options) {
    if (!options) {
        options = {};
    }

    EventEmitter.call(this);

    var self = this;

    // Open serial port connection
    var serialPort = new SerialPort(port || config.defaultPort, config.serialPort);

    var received = '';

    serialPort.on('open', function () {
        console.log('Serial connection established');

        serialPort.on('data', function (data) {
            received += data.toString();

            var startCharPos = received.indexOf(config.startCharacter);
            var endCharPos = received.indexOf(config.stopCharacter);

            // Package is complete if the start- and stop character are received
            if (startCharPos >= 0 && endCharPos >= 0) {
                var packet = received.substr(startCharPos, endCharPos - startCharPos);
                var parsedPacket = parsePacket(packet);

                received = '';

                // Write package to log if debug mode is active
                if (options.debug) {
                    var now = new Date().toUTCString();
                    fs.appendFile(config.debugRawDataFile, 'Package received at ' + now + ':\n' + packet + '\n\n', function (err) {
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

                if (parsedPacket.timestamp !== null) {
                    self.emit('reading', parsedPacket);
                } else {
                    console.error('Invalid reading received, event not emitted.');
                }

                // TODO: create separate events for gas, electricity, etc
            }
        });
    });

    serialPort.on('error', function (error) {
        self.emit('error', error);
    });

    serialPort.on('close', function () {
        self.emit('close');
    });
}

util.inherits(P1Reader, EventEmitter);

module.exports = P1Reader;