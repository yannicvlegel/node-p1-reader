describe("parsePacket", function() {
    var parsePacket = require('../lib/parsePacket');

    var defaultHeader = "/MyMeterType\r\n \r\n";

    it("should be able to parse the packet header containing the meter type", function() {
        var parsedPacket = parsePacket(defaultHeader);

        expect(parsedPacket.meterType).toEqual("MyMeterType");
    });

    it("should return the expected output object", function() {
        var parsedPacket = parsePacket(defaultHeader);

        var expectedOutputObject = {
            meterType: "MyMeterType",
            version: null,
            timestamp: null,
            equipmentId: null,
            electricity: {
                received: {
                    tariff1: {
                        reading: null,
                        unit: null
                    },
                    tariff2: {
                        reading: null,
                        unit: null
                    },
                    actual: {
                        reading: null,
                        unit: null
                    }
                },
                delivered: {
                    tariff1: {
                        reading: null,
                        unit: null
                    },
                    tariff2: {
                        reading: null,
                        unit: null
                    },
                    actual: {
                        reading: null,
                        unit: null
                    }
                },
                tariffIndicator: null,
                threshold: null,
                switchPosition: null,
                numberOfPowerFailures: null,
                numberOfLongPowerFailures: null,
                longPowerFailureLog: null
            },
            gas: {
                equipmentId: null,
                timestamp: null,
                reading: null,
                unit: null,
                valvePosition: null
            }
        };

        expect(parsedPacket).toEqual(expectedOutputObject);
    });

    it("should be able to parse the timestamp (summer time) from a packet", function() {
        var packet = defaultHeader + "0-0:1.0.0(160520213143S)";
        var parsedPacket = parsePacket(packet);

        expect(parsedPacket.timestamp).toEqual("2016-05-20T19:31:43.000Z");
    });

    it("should be able to parse the timestamp (winter time) from a packet", function() {
        var packet = defaultHeader + "0-0:1.0.0(160100000000W)";
        var parsedPacket = parsePacket(packet);

        expect(parsedPacket.timestamp).toEqual("2015-12-30T23:00:00.000Z");
    });

    it("should be able to parse a complete packet", function() {
        var packet = defaultHeader +
            "1-3:0.2.8(42)\r\n" +
            "0-0:1.0.0(160520213143S)\r\n" +
            "0-0:96.1.1(1234567890123456789012345678901234)\r\n" +
            "1-0:1.8.1(000123.456*kWh)\r\n" +
            "1-0:1.8.2(000456.789*kWh)\r\n" +
            "1-0:2.8.1(000200.120*kWh)\r\n" +
            "1-0:2.8.2(000300.230*kWh)\r\n" +
            "0-0:96.14.0(0001)\r\n" +
            "1-0:1.7.0(00.345*kW)\r\n" +
            "1-0:2.7.0(00.456*kW)\r\n" +
            "0-0:96.7.21(00008)\r\n" +
            "0-0:96.7.9(00005)\r\n" +
            "1-0:99.97.0(1)(0-0:96.7.19)(000101000014W)(2147483647*s)\r\n" +
            "1-0:32.32.0(00000)\r\n" +
            "1-0:52.32.0(00000)\r\n" +
            "1-0:72.32.0(00000)\r\n" +
            "1-0:32.36.0(00000)\r\n" +
            "1-0:52.36.0(00000)\r\n" +
            "1-0:72.36.0(00000)\r\n" +
            "0-0:96.13.1()\r\n" +
            "0-0:96.13.0()\r\n" +
            "1-0:31.7.0(001*A)\r\n" +
            "1-0:51.7.0(000*A)\r\n" +
            "1-0:71.7.0(000*A)\r\n" +
            "1-0:21.7.0(00.321*kW)\r\n" +
            "1-0:22.7.0(00.000*kW)\r\n" +
            "1-0:41.7.0(00.001*kW)\r\n" +
            "1-0:42.7.0(00.000*kW)\r\n" +
            "1-0:61.7.0(00.003*kW)\r\n" +
            "1-0:62.7.0(00.000*kW)\r\n" +
            "0-1:24.1.0(003)\r\n" +
            "0-1:96.1.0(1234567890123456789012345678901234)\r\n" +
            "0-1:24.2.1(160520210000S)(00500.123*m3)";

        var parsedPacket = parsePacket(packet);

        var expectedOutputObject = {
            "meterType": "MyMeterType",
            "version": "42",
            "timestamp": "2016-05-20T19:31:43.000Z",
            "equipmentId": "1234567890123456789012345678901234",
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
                "longPowerFailureLog": null
            },
            "gas": {
                "equipmentId": "1234567890123456789012345678901234",
                "timestamp": "2016-05-20T19:00:00.000Z",
                "reading": 500.123,
                "unit": "m3",
                "valvePosition": null
            }
        };

        expect(parsedPacket).toEqual(expectedOutputObject);
    });

});
