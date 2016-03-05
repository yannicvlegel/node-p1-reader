/**
 * Parse P1 packet
 *
 * @param packet : P1 packet according to DSMR4.0 specification
 */
function parsePacket ( packet ) {
    var lines = packet.split("\r\n");
    var parsedPacket = {};

    parsedPacket.electricity            = {};
    parsedPacket.electricity.received   = {};
    parsedPacket.electricity.delivered  = {};
    parsedPacket.gas                    = {};
    parsedPacket.meterType              = lines[ 0 ].substring( 1 );

    // Start parsing at line 3 since first two lines contain the header and an empty row
    for ( var i = 2; i < lines.length; i++ ) {
        if ( lines[ i ] != "" ) {
            var line = parseLine( lines[ i ] );

            switch ( line.obisCode ) {
                case "1-3:0.2.8":
                    parsedPacket.version = line.value;
                    break;

                case "0-0:1.0.0":
                    parsedPacket.timestamp = parseTimestamp( line.value );
                    break;

                case "0-0:96.1.1":
                    parsedPacket.equipmentId = line.value;
                    break;

                case "1-0:1.8.1":
                    parsedPacket.electricity.received.tariff1 = {};
                    parsedPacket.electricity.received.tariff1.reading = parseFloat( line.value );
                    parsedPacket.electricity.received.tariff1.unit    = line.unit;
                    break;

                case "1-0:1.8.2":
                    parsedPacket.electricity.received.tariff2 = {};
                    parsedPacket.electricity.received.tariff2.reading = parseFloat( line.value );
                    parsedPacket.electricity.received.tariff2.unit    = line.unit;
                    break;

                case "1-0:2.8.1":
                    parsedPacket.electricity.delivered.tariff1 = {};
                    parsedPacket.electricity.delivered.tariff1.reading = parseFloat( line.value );
                    parsedPacket.electricity.delivered.tariff1.unit    = line.unit;
                    break;

                case "1-0:2.8.2":
                    parsedPacket.electricity.delivered.tariff2 = {};
                    parsedPacket.electricity.delivered.tariff2.reading = parseFloat( line.value );
                    parsedPacket.electricity.delivered.tariff2.unit    = line.unit;
                    break;

                case "0-0:96.14.0":
                    parsedPacket.electricity.tariffIndicator = parseInt( line.value );
                    break;

                case "1-0:1.7.0":
                    parsedPacket.electricity.received.actual = {};
                    parsedPacket.electricity.received.actual.reading = parseFloat( line.value );
                    parsedPacket.electricity.received.actual.unit    = line.unit;
                    break;

                case "1-0:2.7.0":
                    parsedPacket.electricity.delivered.actual = {};
                    parsedPacket.electricity.delivered.actual.reading = parseFloat( line.value );
                    parsedPacket.electricity.delivered.actual.unit    = line.unit;
                    break;

                case "0-0:17.0.0":
                    parsedPacket.electricity.threshold = {};
                    parsedPacket.electricity.threshold.value = parseFloat( line.value );
                    parsedPacket.electricity.threshold.unit  = line.unit;
                    break;

                case "0-0:96.3.10":
                    parsedPacket.electricity.switchPosition = line.value;
                    break;

                case "0-0:96.7.21":
                    parsedPacket.electricity.numberOfPowerFailures = parseInt( line.value );
                    break;

                case "0-0:96.7.9":
                    parsedPacket.electricity.numberOfLongPowerFailures = parseInt( line.value );
                    break;

                case "1-0:99:97.0":
                    parsedPacket.electricity.longPowerFailureLog = parsePowerFailureEventLog( line.value );
                    break;

                // TODO: complete with missing fields

                // TODO: correctly determine gas installation based on format 0-n (there can be multiple connected devices)
                case "0-1:96.1.0":
                    parsedPacket.gas.equipmentId = line.value;
                    break;

                case "0-1:24.2.1":
                    parsedPacket.gas.timestamp  = parseTimestamp( parseHourlyReading( line.value ).timestamp );
                    parsedPacket.gas.reading    = parseFloat( parseHourlyReading( line.value ).value );
                    parsedPacket.gas.unit       = parseHourlyReading( line.value ).unit;
                    break;

                case "0-1:24.4.0":
                    parsedPacket.gas.valvePosition = line.value;
                    break;

                //TODO: complete with missing fields

            }
        }
    }


    return parsedPacket;
}

/**
 * Parse a single line of the P1 packet
 *
 * @param line : Single line of format: obisCode(value*unit), example: 1-0:2.8.1(123456.789*kWh)
*/
function parseLine ( line ) {
    var output = {};
    var split = line.split( /\((.+)?/ ); // Split only on first occurence of "("
    var value = split[ 1 ].substring( 0, split[ 1 ].length - 1 );

    output.obisCode = split[ 0 ];

    if ( value.indexOf( "*" ) > -1 && value.indexOf( ")(" ) === -1 ) {
        output.value = value.split( "*" )[ 0 ];
        output.unit  = value.split( "*" )[ 1 ];
    } else {
        output.value = value;
    }

    return output;
}

/**
 * Parse timestamp
 *
 * @param timestamp : Timestamp of format: YYMMDDhhmmssX
 */
function parseTimestamp ( timestamp ) {
    var parsedTimestamp = new Date();

    parsedTimestamp.setUTCFullYear(     parseInt( timestamp.substring( 0, 2 ) ) + 2000  );
    parsedTimestamp.setUTCMonth(        parseInt( timestamp.substring( 2, 4 ) ) - 1     );
    parsedTimestamp.setUTCDate(         timestamp.substring( 4, 6 )                     );

    if ( timestamp.substring( 12 ) === "S" ) {
        parsedTimestamp.setUTCHours(    timestamp.substring( 6, 8 ) + 1                 );
    } else {
        parsedTimestamp.setUTCHours(    timestamp.substring( 6, 8 )                     );
    }

    parsedTimestamp.setUTCMinutes(      timestamp.substring( 8, 10 )                    );
    parsedTimestamp.setUTCSeconds(      timestamp.substring( 10, 12 )                   );
    parsedTimestamp.setUTCMilliseconds( 0                                               );

    return parsedTimestamp.toISOString();
}

/**
 * Parse power failure event log
 *
 * @param log : Power failure event log of format: (value)(value)(value)...
 */
function parsePowerFailureEventLog ( log ) {
    // TODO: parse event log

    return log;
}

/**
 * Parse hourly readings, which is used for gas, water, heat, cold and slave electricity meters
 *
 * @param reading : Reading of format: (value)(value)
 */
function parseHourlyReading ( reading ) {
    var output = {};
    var split = reading.split( ")(" );

    output.timestamp = split[ 0 ];
    output.value     = split[ 1 ].split( "*" )[ 0 ];
    output.unit      = split[ 1 ].split( "*" )[ 1 ];

    return output;
}

module.exports = parsePacket;