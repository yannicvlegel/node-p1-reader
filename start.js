var SerialPort = require( "serialport" ).SerialPort;

var parsePacket = require( "./src/parsePacket" );
var config = require( "./config/config.json" );

// Open serial port connection
var serialPort = new SerialPort( "/dev/ttyUSB0", config.serialPort );

var received = "";

serialPort.on( "open", function () {
    console.log( "Serial connection established" );

    serialPort.on( "data", function( data ) {
        received += data.toString();

        var startCharPos = received.indexOf( config.startCharacter );
        var endCharPos   = received.indexOf( config.stopCharacter );

        // Package is complete if the start- and stop character are received
        if( startCharPos >= 0 && endCharPos >= 0 ) {
            var packet = received.substr( startCharPos, endCharPos - startCharPos );

            var parsedData = parsePacket( packet );

            received = "";

            console.log("PARSED DATA:", JSON.stringify(parsedData, null, 4));

        }
    });
});

serialPort.on( "error", function ( error ) {
    console.log( "[ERROR] Problem with serial connection: " + error );
});