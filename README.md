# Node.js P1-Reader
Node.js package for reading and parsing data from the P1 port of a Dutch Smart Meter.
Data is parsed according to the official 2011 DSMR4.0 specification by Netbeheer Nederland, which is used by most popular Kaifa and Landis+Gyr Smart Meters.

How to use
==========

The serial connection is automatically opened on initiating the P1-Reader. Use the `reading` event to start receiving data, which should come in every 10 seconds.

```
var P1Reader = require('../main');
var fs = require('fs');

var p1Reader = new P1Reader();

p1Reader.on('reading', function(data) {
    console.log('Reading received: currently consuming ' + data.electricity.received.actual.reading + data.electricity.received.actual.unit);
});

p1Reader.on('error', function(data) {
    console.log('Error while reading: ' + data);
});
```

Events
======

The module emits the following events:

* `reading` : When a reading is received via the serial connection (should be on a 10 second interval)
* `error` : When the serial connection emits an error
* `close` : When the serial connection closes for some reason

Reading structure
=================

The `reading` event returns the following data structure:

```
{
    "meterType": "MyMeterType",
    "version": "42",
    "timestamp": "2016-05-20T19:31:43.000Z",
    "equipmentId": "1234567890123456789012345678901234",
    "textMessage": {
        "codes": "12345678",
        "message": "0123456789:;<=>?"
    },
    "electricity": {
        "received": {
            "tariff1": {
                "reading": 123.456,
                "unit": "kWh"
            },
            "tariff2": {
                "reading": 456.789,
                "unit": "kWh"
            },
            "actual": {
                "reading": 0.345,
                "unit": "kW"
            }
        },
        "delivered": {
            "tariff1": {
                "reading": 200.12,
                "unit": "kWh"
            },
            "tariff2": {
                "reading": 300.23,
                "unit": "kWh"
            },
            "actual": {
                "reading": 0.456,
                "unit": "kW"
            }
        },
        "tariffIndicator": 1,
        "threshold": null,
        "switchPosition": null,
        "numberOfPowerFailures": 8,
        "numberOfLongPowerFailures": 5,
        "longPowerFailureLog": {
            "count": 1,
            "log": [
                {
                    "endOfFailure": "1999-12-31T23:00:14.000Z",
                    "duration": 2147483647,
                    "unit": "s"
                }
            ]
        },
        "voltageSags": {
            "L1": 1,
            "L2": 2,
            "L3": 3
        },
        "voltageSwell": {
            "L1": 4,
            "L2": 5,
            "L3": 6
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
                        "reading": 0.201,
                        "unit": "kW"
                    },
                    "L2": {
                        "reading": 0.401,
                        "unit": "kW"
                    },
                    "L3": {
                        "reading": 0.601,
                        "unit": "kW"
                    }
                },
                "negative": {
                    "L1": {
                        "reading": 0.222,
                        "unit": "kW"
                    },
                    "L2": {
                        "reading": 0.422,
                        "unit": "kW"
                    },
                    "L3": {
                        "reading": 0.622,
                        "unit": "kW"
                    }
                }
            }
        }
    },
    "gas": {
        "deviceType": "003",
        "equipmentId": "1234567890123456789012345678901234",
        "timestamp": "2016-05-20T19:00:00.000Z",
        "reading": 500.123,
        "unit": "m3",
        "valvePosition": null
    }
}
```

Debug mode
==========

In debug mode all raw and parsed packages are written to 2 separate log files (debug-data-raw.log and debug-data-parsed.log) and stored in the directory from which the module was triggered.

Provide the `debug` option parameter to run the module in debug mode:

```
var p1Reader = new P1Reader({debug: true});
```

Official DSMR documentation
===========================

The official DSMR Smart Meter P1 interface documentation from Netbeheer Nederland can be found here:
http://www.netbeheernederland.nl/publicaties/publicatie/?documentregistrationid=1745033
This documentation was used as a reference to create and verify this module.