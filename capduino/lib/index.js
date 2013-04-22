var serial = require('serialport'),
	events = require('events'),
	util = require('util');

var capduino = function(options) {
	var self = this;
	events.EventEmitter.call(self);

	options = options || { };
	options.serialport = options.serialport || "/dev/tty-usbserial1";
	options.baudrate = options.baudrate || 115200;

	self.WATCHCAP		= "08";

	self.sp = new serial.SerialPort(options.serialport, {
		parser : serial.parsers.readline('\n'),
		baudrate : options.baudrate
	});

	self.sp.on("data", function(data) {
		self.parse(data);
	});

	self.parse = function (data) {
		var command;
		var args = data.split(":",3);
		args = [args[1], args[2]];
		self.emit('watchcap', args);
	};
};

util.inherits(capduino, events.EventEmitter);
exports = module.exports = capduino;