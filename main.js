var EventEmitter = require('events');
var util = require('util');
var SerialPort = require('serialport').SerialPort;

var parsePacket = require('./src/parsePacket');
var config = require('./config/config.json');

function P1Reader(port) {
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

                received = '';

                self.emit('reading', parsePacket(packet));
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