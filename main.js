var EventEmitter = require('events');
var util = require('util');
var fs = require('fs');
var serialPort = require('serialport');
var SerialPort = serialPort.SerialPort;

var serialPortFound = false;

var parsePacket = require('./src/parsePacket');
var debug = require('./src/debug');
var config = require('./config/config.json');

function P1Reader(options) {
    if (!options) {
        options = {};
    }

    var self = this;

    EventEmitter.call(this);

    // Automatically find the correct serial port
    serialPort.list(function (err, ports) {
        if ( err ) {
            throw new Error( 'Serialports could not be listed: ' + err );
        }

        _setupSerialConnection(self, ports[ ports.length - 1 ].comName, options);
    });
}

util.inherits(P1Reader, EventEmitter);

module.exports = P1Reader;


/**
 * Setup serial port connection
 *
 * @param self : The 'this'-object of the constructor to emit events on
 * @param options : Options object
 */
function _setupSerialConnection (self, port, options) {
    console.log('Trying to connect to Smart Meter via port: ' + port);

    // Open serial port connection
    var sp = new SerialPort(port || config.defaultPort, config.serialPort);

    var received = '';

    sp.on('open', function () {
        console.log('Serial connection established');

        sp.on('data', function (data) {
            received += data.toString();

            var startCharPos = received.indexOf(config.startCharacter);
            var endCharPos = received.indexOf(config.stopCharacter);

            // Package is complete if the start- and stop character are received
            if (startCharPos >= 0 && endCharPos >= 0) {
                var packet = received.substr(startCharPos, endCharPos - startCharPos);
                var parsedPacket = parsePacket(packet);

                received = '';

                // Write packet to log if debug mode is active
                if (options.debug) {
                    debug.writeToLogFile(packet, parsedPacket);
                }

                if (parsedPacket.timestamp !== null) {
                    self.emit('reading', parsedPacket);
                } else {
                    console.error('Invalid reading received, event not emitted.');
                    // TODO: set a limiter on the amount of these errors, restart if it occured 5 times
                }
            }
        });
    });

    sp.on('error', function (error) {
        self.emit('error', error);
    });

    sp.on('close', function () {
        self.emit('close');
    });
}