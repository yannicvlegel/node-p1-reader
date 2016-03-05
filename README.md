# Node.js P1-Reader
Node.js package for reading and parsing data from the P1 port of a Dutch Smart Meter.
Data is parsed according to the official 2011 DSMR4.0 specification by Netbeheer Nederland, which is used by most popular Kaifa and Landis+Gyr Smart Meters.

How to use
==========

The serial connection is automatically opened on initiating the P1-Reader. Use the `reading` event to start receiving data, which should come in every 10 seconds.

```
var P1Reader = require('../main');
var fs = require('fs');

var p1Reader = new P1Reader('/dev/ttyUSB0');

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
    "meterType": "KFM5KAIFA-METER",
    "version": "42",
    "timestamp": "2016-03-05T16:52:50.000Z",
    "equipmentId": "4530303033303030303035393034333134",
    "electricity": {
        "received": {
            "tariff1": {
                "reading": 83.867,
                "unit": "kWh"
            },
            "tariff2": {
                "reading": 60.363,
                "unit": "kWh"
            },
            "actual": {
                "reading": 0.147,
                "unit": "kW"
            }
        },
        "delivered": {
            "tariff1": {
                "reading": 0,
                "unit": "kWh"
            },
            "tariff2": {
                "reading": 0,
                "unit": "kWh"
            },
            "actual": {
                "reading": 0,
                "unit": "kW"
            }
        },
        "tariffIndicator": 1,
        "threshold": null,
        "switchPosition": null,
        "numberOfPowerFailures": 8,
        "numberOfLongPowerFailures": 5,
        "longPowerFailureLog": null
    },
    "gas": {
        "equipmentId": "4730303139333430323230323137323135",
        "timestamp": "2016-03-05T16:00:00.000Z",
        "reading": 98.391,
        "unit": "m3",
        "valvePosition": null
    }
}
```