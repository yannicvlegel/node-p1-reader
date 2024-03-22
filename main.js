const EventEmitter = require('events');
const util = require('util');
let { SerialPort } = require('serialport');
const { DelimiterParser } = require('@serialport/parser-delimiter');

let connectedToSmartMeter = false;
let constructor;

const parsePacket = require('./lib/parsePacket');
const debug = require('./lib/debug');
const config = require('./config/config.json');

function P1Reader(options) {
    if (typeof options !== 'object' || options.port == "" || options.baudRate == "" || options.parity == "" || options.dataBits == "" || options.stopBits == "") {
        console.error("Parameters 'port', 'baudRate', 'parity', 'dataBits' and 'stopBit' are required since version 2.x.x to instantiate the module");
    }

    if (options.debug) {
        debug.enableDebugMode();
    }

    // Overwrite serialport module when emulator mode is set
    if (options.emulator) {
        SerialPort = require('./lib/emulateSerialport');
        SerialPort.setEmulatorOverrides(options.emulatorOverrides);
    }

    constructor = this;

    EventEmitter.call(this);
    
    _setupSerialConnection(options.port, options.baudRate, options.parity, options.dataBits, options.stopBits);
}

util.inherits(P1Reader, EventEmitter);

module.exports = P1Reader;

/**
 * Setup serial port connection
 */
function _setupSerialConnection(port, baudRate, parity, dataBits, stopBits) {
    debug.log('Trying to connect to Smart Meter via port: ' + port + ' (BaudRate: ' + baudRate + ', Parity: ' + parity + ', Databits: ' + dataBits + ', Stopbits: ' + stopBits + ')');

    // Open serial port connection
    const sp = new SerialPort({
        path: port,
        baudRate: baudRate,
        parity: parity,
        dataBits: dataBits,
        stopBits: stopBits
    });

    const connectionTimeout = setTimeout(() => {
        if (!connectedToSmartMeter) {
            debug.log('Could not establish a connection with the Smart Meter (connection timeout)');
            constructor.emit('error', 'Connection timeout');
        }
    }, 11000); // Set time for 11 seconds, since we should receive at least one message every 10 seconds from the Smart Meter

    const parser = sp.pipe(new DelimiterParser({ 
        delimiter: config.stopCharacter
    }));    

    parser.on('data', data => {
        const received = data.toString();

        const startCharPos = received.indexOf(config.startCharacter);
        if (startCharPos === -1) {
            debug.log('no message start found in', received);
            return;
        }
        const packet = received.substring(startCharPos);

        const parsedPacket = parsePacket(packet);
        // Emit a 'connected' event when we have actually successfully parsed our first data                
        if (!connectedToSmartMeter && parsedPacket.timestamp !== null) {
            debug.log('Connection with Smart Meter established');
            constructor.emit('connected');
            connectedToSmartMeter = true;
            clearTimeout(connectionTimeout);
        }

        debug.writeToLogFile(packet, parsedPacket);

        constructor.emit('reading-raw', packet);

        if (parsedPacket.timestamp !== null) {
            constructor.emit('reading', parsedPacket);
        } else {
            constructor.emit('error', 'Invalid reading');
        }
    });

    sp.on('open', () => {
        debug.log('Serialport connection opened, trying to receive data from the Smart Meter...');
    });

    sp.on('error', (error) => {
        debug.log('Error emitted: ' + error);
        constructor.emit('error', error);
    });

    sp.on('close', () => {
        debug.log('Connection closed');
        constructor.emit('close');
    });

    constructor.close = (cb) => {
        debug.log('Closing connection');
        sp.close(cb);
    };
}