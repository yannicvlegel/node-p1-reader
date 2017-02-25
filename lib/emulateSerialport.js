var EventEmitter = require('events');
var util = require('util');
var config = require('../config/config.json');

var electricityStart = 1000;
var electricityIncrement = 100;
var gasStart = 500;
var gasIncrement = 50;
var incrementCycle = 0;

/**
 * Emulate a subset of the features of the serialport module
 *
 * @param {string} path - Path to the serial port to open
 * @param {Object} options - Port configuration options
 * @param {function} callback - Called when a connection is opened
 * @param {number} electricityStartOverride - Override the starting value of electricity on tariff 1 in kWh
 * @param {number} electricityIncrementOverride - Override the incremental value (every 10 seconds) of electricity on tariff 1 in kW
 * @param {number} gasStartOverride - Override the starting value of gas in m3
 * @param {number} gasIncrementOverride - Override the incremental value (every hour) of gas in m3
 * @emits #open - triggered after a short delay to mimic connection setup
 * @emits #data - triggered every 10 seconds
 */
function EmulateSerialport(path, options, callback, electricityStartOverride, electricityIncrementOverride, gasStartOverride, gasIncrementOverride) {
    var constructor = this;

    EventEmitter.call(this);

    // Override default values if set
    if (electricityStartOverride) {
        electricityStart = electricityStartOverride;
    }

    if (electricityIncrementOverride) {
        electricityIncrement = electricityIncrementOverride;
    }

    if (gasStartOverride) {
        gasStart = gasStartOverride;
    }

    if (gasIncrementOverride) {
        gasIncrement = gasIncrementOverride;
    }

    // Delay the opening of a connection so the listeners have time to initiate before the event is emitted
    setTimeout(function() {
        constructor.emit('open');
    }, 500);

    // Start sending data
    setInterval(function() {
        var nextValues = _calculateIncrementedValues();

        var packet = _createSerialPacket(
            _convertDatetimeString('2010-12-09 10:30:20'),
            1234,
            2345,
            _convertDatetimeString('2010-12-09 10:00:00'),
            500
        );

        for(var i = 0; i < packet.length; i++) {
            constructor.emit('data', packet[i]);
        }
    }, config.emulatorInterval);
}

util.inherits(EmulateSerialport, EventEmitter);

/**
 * Emulate listing all available serial ports
 *
 * @param {function} callback - Callback function with parameters "error" and "ports"
 */
EmulateSerialport.list = function (callback) {
    var ports = [{"comName": "/dev/emulator"}];

    callback(null, ports);
};


module.exports = EmulateSerialport;


/**
 * Calculating the incremented values for creating the next packet
 *
 * @return {}
 */
function _calculateIncrementedValues() {

}

/**
 * Create an array containing a serial port packet
 *
 * @param {string} timestamp - Timestamp of the packet in format: YYMMDDhhmmssX
 * @param {number} electricityReceivedTariff1 - Electricity received total on tariff 1 in kWh
 * @param {number} electricityReceivedActual - Electricity received actual in kW
 * @param {string} gasTimestamp - Timestamp of the last hourly gas reading in format: YYMMDDhhmmssX
 * @param {number} gasReading - Gas received actual in M3
 * @return {string[]} Containing the lines of an serial message as a string (first/last line contain the start/end characters resp.)
 */
function _createSerialPacket(timestamp, electricityReceivedTariff1, electricityReceivedActual, gasTimestamp, gasReading) {
    var packet = Array();

    packet.push('/EMULATOR\n');
    packet.push('1-3:0.2.8(10)\n');
    packet.push('0-0:1.0.0(' + timestamp + ')\n');
    packet.push('0-0:96.1.1(1234567890123456789012345678901234)\n');
    packet.push('1-0:1.8.1(' + electricityReceivedTariff1 + '*kWh)\n');
    packet.push('1-0:1.8.2(000000.000*kWh)\n');
    packet.push('1-0:2.8.1(000000.000*kWh)\n');
    packet.push('1-0:2.8.2(000000.000*kWh)\n');
    packet.push('0-0:96.14.0(0001)\n');
    packet.push('1-0:1.7.0(' + electricityReceivedActual + '*kW)\n');
    packet.push('1-0:2.7.0(00.000*kW)\n');
    packet.push('0-0:96.7.21(00001)\n');
    packet.push('0-0:96.7.9(00002)\n');
    packet.push('1-0:99.97.0(1)(0-0:96.7.19)(000101000014W)(1000*s)\n');
    packet.push('1-0:32.32.0(00000)\n');
    packet.push('1-0:52.32.0(00000)\n');
    packet.push('1-0:72.32.0(00000)\n');
    packet.push('1-0:32.36.0(00000)\n');
    packet.push('1-0:52.36.0(00000)\n');
    packet.push('1-0:72.36.0(00000)\n');
    packet.push('0-0:96.13.1()\n');
    packet.push('0-0:96.13.0()\n');
    packet.push('1-0:31.7.0(001*A)\n');
    packet.push('1-0:51.7.0(002*A)\n');
    packet.push('1-0:71.7.0(003*A)\n');
    packet.push('1-0:21.7.0(00.001*kW)\n');
    packet.push('1-0:22.7.0(00.004*kW)\n');
    packet.push('1-0:41.7.0(00.002*kW)\n');
    packet.push('1-0:42.7.0(00.005*kW)\n');
    packet.push('1-0:61.7.0(00.003*kW)\n');
    packet.push('1-0:62.7.0(00.006*kW)\n');
    packet.push('0-1:24.1.0(003)\n');
    packet.push('0-1:96.1.0(2345678901234567890123456789012345)\n');
    packet.push('0-1:24.2.1(' + gasTimestamp + ')(' + gasReading + '*m3)!');

    return packet;
}

/**
 * Format a datetime string to the format that is used by the Smart Meter according to the DSMR 4.0 specification
 *
 * @param {string} datetime - string containing a date and time that is accepted by Date()
 * @return {string} Date string in format: YYMMDDhhmmssX
 */
function _convertDatetimeString(datetime) {
    var timestamp = new Date(datetime);
    var output = '';

    output += (timestamp.getFullYear()).toString().substring(2, 4);
    output += (timestamp.getMonth() + 1);
    output += ('0' + timestamp.getDate()).slice(-2); // Add leading zero
    output += ('0' + timestamp.getHours()).slice(-2); // Add leading zero
    output += ('0' + timestamp.getMinutes()).slice(-2); // Add leading zero
    output += ('0' + timestamp.getSeconds()).slice(-2); // Add leading zero
    output += 'W';

    return output;
}