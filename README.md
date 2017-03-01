# Node.js P1-Reader
Node.js package for reading and parsing data from the P1 port of a Dutch Smart Meter.
Data is parsed according to the official DSMR4.0 specification by Netbeheer Nederland, which is currently used by most popular Kaifa and Landis+Gyr Smart Meters.

How to use
==========

The serial connection is automatically opened on initiating the P1-Reader. Use the `reading` event to start receiving data, which should come in every 10 seconds.

```
var P1Reader = require('p1-reader');
var p1Reader = new P1Reader();

p1Reader.on('reading', function(data) {
    console.log('Currently consuming: ' + data.electricity.received.actual.reading + data.electricity.received.actual.unit);
});

p1Reader.on('error', function(err) {
    console.log('Error while reading: ' + err);
});
```

Events
======

The module emits the following events:

* `connected` : When a connection with the Smart Meter was successfully setup
* `reading` : When a reading is received via the serial connection (should be on a 10 second interval)
* `error` : When the serial connection emits an error
* `close` : When the serial connection closes for some reason

Reading structure
=================

The `reading` event returns the following data structure:

```
{
    "meterType": "ISk5\2MT382-1000",
    "version": "42",
    "timestamp": "2010-12-09T10:30:20.000Z",
    "equipmentId": "4B384547303034303436333935353037",
    "textMessage": {
        "codes": "3031203631203831",
        "message": "0123456789:;<=>?0123456789:;<=>?0123456789:;<=>?0123456789:;<=>?0123456789:;<=>?"
    },
    "electricity": {
        "received": {
            "tariff1": {
                "reading": 123456.789,
                "unit": "kWh"
            },
            "tariff2": {
                "reading": 123456.789,
                "unit": "kWh"
            },
            "actual": {
                "reading": 1.193,
                "unit": "kW"
            }
        },
        "delivered": {
            "tariff1": {
                "reading": 123456.789,
                "unit": "kWh"
            },
            "tariff2": {
                "reading": 123456.789,
                "unit": "kWh"
            },
            "actual": {
                "reading": 0,
                "unit": "kW"
            }
        },
        "tariffIndicator": 2,
        "threshold": {
            "value": 16.1,
            "unit": "kW"
        },
        "switchPosition": "1",
        "numberOfPowerFailures": 4,
        "numberOfLongPowerFailures": 2,
        "longPowerFailureLog": {
            "count": 2,
            "log": [
                {
                    "startOfFailure": "2010-12-08T14:20:15.000Z",
                    "endOfFailure": "2010-12-08T14:24:15.000Z",
                    "duration": 240,
                    "unit": "s"
                },
                {
                    "startOfFailure": "2010-12-08T14:05:03.000Z",
                    "endOfFailure": "2010-12-08T14:10:04.000Z",
                    "duration": 301,
                    "unit": "s"
                }
            ]
        },
        "voltageSags": {
            "L1": 2,
            "L2": 1,
            "L3": 0
        },
        "voltageSwell": {
            "L1": 0,
            "L2": 3,
            "L3": 0
        },
        "instantaneous": {
            "current": {
                "L1": {
                    "reading": 1,
                    "unit": "A"
                },
                "L2": {
                    "reading": 2,
                    "unit": "A"
                },
                "L3": {
                    "reading": 3,
                    "unit": "A"
                }
            },
            "power": {
                "positive": {
                    "L1": {
                        "reading": 1.111,
                        "unit": "kW"
                    },
                    "L2": {
                        "reading": 2.222,
                        "unit": "kW"
                    },
                    "L3": {
                        "reading": 3.333,
                        "unit": "kW"
                    }
                },
                "negative": {
                    "L1": {
                        "reading": 4.444,
                        "unit": "kW"
                    },
                    "L2": {
                        "reading": 5.555,
                        "unit": "kW"
                    },
                    "L3": {
                        "reading": 6.666,
                        "unit": "kW"
                    }
                }
            }
        }
    },
    "gas": {
        "deviceType": "003",
        "equipmentId": "3232323241424344313233343536373839",
        "timestamp": "2010-12-09T10:00:00.000Z",
        "reading": 12785.123,
        "unit": "m3",
        "valvePosition": "1"
    }
}
```

Emulator mode
==========

Since your development machine is usually not connected to the serial port directly the emulator mode can be enabled.
When enabled the module will not connect to a serial port but instead will use a mocked version that will emit messages according to the DSMR 4.0 specification.

The emulator will emit a reading event every 10 seconds just like an actual Smart Meter would do with the most important variables (timestamp, electricity.received.tariff1, electricity.received.actual, gas.timestamp and gas.reading) being incremented.

Provide the `emulator` option parameter to run the module in emulator mode:

```
var p1Reader = new P1Reader({emulator: true});
```

The emulator defaults can be overriden by passing an `emulatorOverrides` object, which can contain the following parameters:

* `electricityOffset` : Starting value of electricity on tariff 1 in kWh (default: 0)
* `electricityIncrement` : Incremental value (every 10 seconds) of electricity on tariff 1 in kW (default: 0.1)
* `gasOffset` : Starting value of gas in m3 (default: 0)
* `gasIncrement` : Incremental value (every hour) of gas in m3 (default: 0.1)
* `interval` : Interval (in seconds) in which readings are emitted (default: 10)
* `intervalGas` Interval (in seconds) in which the gas reading is incremented (default: 3600)


Debug mode
==========

In debug mode all raw and parsed packages are written to 2 separate log files (debug-data-raw.log and debug-data-parsed.log) and stored in the directory from which the module was triggered.

Provide the `debug` option parameter to run the module in debug mode:

```
var p1Reader = new P1Reader({debug: true});
```

Force specific serial port
==========================

If for some reason the automatic serial port discovery does not work it is possible to force a certain port.

Provide the `serialPort` option parameter to use a specific serial port:

```
var p1Reader = new P1Reader({serialPort: '/dev/tty-usbserial1'});
```

Official DSMR documentation
===========================

The official DSMR Smart Meter P1 interface documentation from Netbeheer Nederland can be found here:
http://www.netbeheernederland.nl/publicaties/publicatie/?documentregistrationid=1745033
This documentation was used as a reference to create and verify this module.

Changelog
=========

1.4.0
- Exposing and calculating the datetime of the start of a LongPowerFailure

1.3.1
- Added option to control the interval of the emulator mode via an option parameter

1.3.0
- Added emulator mode for development purposes
- Extended example with all possible option parameters

1.2.0
- Upgraded serialport to 4.0.7
- Serial port is now automatically locked preventing other processes from opening it
- Added 'connected' event
- Exposed used serial port name via getSerialPort()

1.1.1
- Minor bug fix

1.1.0
- Added option to force a specific port
- Log more debugging information

1.0.1
- Updated readme

1.0.0
- Initial version with full DSMR 4.0 specification implemented