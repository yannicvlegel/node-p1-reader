var EventEmitter = require('events');
var util = require('util');
var config = require('../config/config.json');

/**
 * Mock a subset of the features of the serialport module
 *
 * @param {string} path - Path to the serial port to open
 * @param {Object} options - Port configuration options
 * @param {function} callback - Called when a connection is opened
 * @emits #open - triggered after a short delay to mimic connection setup
 * @emits #data - triggered every 10 seconds
 */
function MockSerialport(path, options, callback) {
    var constructor = this;

    EventEmitter.call(this);

    // Delay the opening of a connection
    setTimeout(function() {
        constructor.emit('open');
    }, 1000);

    // Start sending data
    setTimeout(function() {
        var packet = _createSerialPacket(_convertDatetimeString('2010-12-09 10:30:20'), 1234, 2345);

        for(var i = 0; i < packet.length; i++) {
            constructor.emit('data', packet[i]);
        }
    }, config.mockDataInterval);
}

util.inherits(MockSerialport, EventEmitter);

/**
 * Mock for listing all available serial ports
 *
 * @param {function} callback - Callback function with parameters "error" and "ports"
 */
MockSerialport.list = function (callback) {
    var ports = [{"comName": "/dev/mock"}];

    callback(null, ports);
};


module.exports = MockSerialport;


/**
 * Create an array containing a serial port packet
 *
 * @param {string} timestamp - Timestamp of the packet in format: YYMMDDhhmmssX
 * @param {number} electricityReceivedActual - Electricity received actual in kW
 * @param {number} gasReceivedActual - Gas received actual in M3
 * @return {string[]} Containing the lines of an serial message as a string (first/last line contain the start/end characters resp.)
 */
function _createSerialPacket(timestamp, electricityReceivedActual, gasReceivedActual) {
    var packet = Array();

    packet.push('/KFM5KAIFA-METER\n');
    packet.push('1-3:0.2.8(42)\n');
    packet.push('0-0:1.0.0(' + timestamp + ')\n');
    packet.push('0-0:96.1.1(1234567890123456789012345678901234)\n');
    packet.push('1-0:1.8.1(000371.313*kWh)\n');
    packet.push('1-0:1.8.2(000240.340*kWh)\n');
    packet.push('1-0:2.8.1(000000.000*kWh)\n');
    packet.push('1-0:2.8.2(000000.000*kWh)\n');
    packet.push('0-0:96.14.0(0001)\n');
    packet.push('1-0:1.7.0(' + electricityReceivedActual + '*kW)\n');
    packet.push('1-0:2.7.0(00.000*kW)\n');
    packet.push('0-0:96.7.21(00008)\n');
    packet.push('0-0:96.7.9(00005)\n');
    packet.push('1-0:99.97.0(1)(0-0:96.7.19)(000101000014W)(2147483647*s)\n');
    packet.push('1-0:32.32.0(00000)\n');
    packet.push('1-0:52.32.0(00000)\n');
    packet.push('1-0:72.32.0(00000)\n');
    packet.push('1-0:32.36.0(00000)\n');
    packet.push('1-0:52.36.0(00000)\n');
    packet.push('1-0:72.36.0(00000)\n');
    packet.push('0-0:96.13.1()\n');
    packet.push('0-0:96.13.0()\n');
    packet.push('1-0:31.7.0(001*A)\n');
    packet.push('1-0:51.7.0(000*A)\n');
    packet.push('1-0:71.7.0(000*A)\n');
    packet.push('1-0:21.7.0(00.170*kW)\n');
    packet.push('1-0:22.7.0(00.000*kW)\n');
    packet.push('1-0:41.7.0(00.000*kW)\n');
    packet.push('1-0:42.7.0(00.000*kW)\n');
    packet.push('1-0:61.7.0(00.003*kW)\n');
    packet.push('1-0:62.7.0(00.000*kW)\n');
    packet.push('0-1:24.1.0(003)\n');
    packet.push('0-1:96.1.0(4730303139333430323230323137323135)\n');
    packet.push('0-1:24.2.1(160606220000S)(' + gasReceivedActual + '*m3)!');

    return packet;
}

/**
 * Format a datetime string to the format that is used by the Smart Meter according to the DSMR 4.0 specification
 *
 * @param {Date} datetime - string containing a date and time that is accepted by Date()
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

    console.log(datetime);
    console.log(output);

    return output;
}