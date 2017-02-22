describe("parsePacket", function() {
    var parsePacket = require('../lib/parsePacket');

    var defaultHeader = "/MyMeterType\r\n \r\n";

    it("should be able to parse the packet header containing the meter type", function() {
        var parsedPacket = parsePacket(defaultHeader);

        expect(parsedPacket.meterType).toEqual("MyMeterType");
    });


});
