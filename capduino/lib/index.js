var serial = require('serialport'),
	events = require('events'),
	util = require('util');

var capduino = function(options) {
	var self = this;
	events.EventEmitter.call(self);

	options = options || { };
	options.serialport = options.serialport || "/dev/tty-usbserial1";
	options.baudrate = options.baudrate || 115200;

	self.INIT       = "00";
	self.ERROR      = "01";
	self.PING       = "02";
	self.PONG       = "03";
	self.GET        = "04";
	self.SET        = "05";
	self.UNWATCH    = "07";
	self.WATCHCAP		= "08";
	self.OK         = "23";

	self.sp = new serial.SerialPort(options.serialport, {
		parser : serial.parsers.readline('\n'),
		baudrate : options.baudrate
	});

	self.sp.on("data", function(data) {
		self.parse(data);
	});

	self.parse = function (data) {
		data = data.replace("\n", "");
		var command;
		var args = [ ];
		var comment;

		if (data.length < 2) {
			//self.send(self.ERROR, [ "Unknown Packet", data ]);
			return;
		}

		command = data.substring(0, 2);
		data = data.substring(2);

		var count = 0;
		var pos = 0;
		while (pos < data.length) {
			// comment
			if (data[pos] == '#') {
			comment = data.substring(pos + 1);
			break;
		}

		// delimiter
		else if (data[pos] == ':') {
			var scount = 0;
				pos++;
				var ssize = "";

			while (data[pos] != ':') {
				ssize += data[pos];
				scount++;
				pos++;

				if (scount == 5) {
					self.send(self.ERROR, [ "Argument Too Long", data ]);
					return;
				}
			}

			if (scount) {
				if (parseInt(ssize, 10) >= self.MAX_BUFFER) {
					self.send(self.ERROR, [ "Argument Too Long", data ]);
					return;
				}

				pos++;
				args[count] = "";
				for (var i = pos; i < pos + parseInt(ssize, 10); i++) {
					args[count] += data[i];
				}

				count++;
				pos += parseInt(ssize, 10) - 1;
			}
		} else {
			//self.send(self.ERROR, [ "Invalid Argument", count ]);
			return;
		}

		pos++;
	}

	switch (command) {
		case self.PONG:
		self.emit('pong');
		break;

	case self.INIT:
		self.emit('init', args, comment);
		break;

	case self.PONG:
		self.emit('pong', args, comment);
		break;

	case self.GET:
		self.emit('get', args, comment);
		break;

	case self.OK:
		self.emit('ok', args, comment);
		break;

	case self.WATCHCAP:
		self.emit('watchcap', args, comment);
		break;

	case self.ERROR:
		self.emit('exception', args, comment);
		break;

	default:
		console.log("default: " + command + " => " + data);
		//self.send(self.ERROR, [ "Unknown Command", command ]);
		}
	};

	self.send = function (command, data, comment) {
		var packet = command;

		for (var i = 0; data && i < data.length; i++) {
			packet += ':' + data[i].toString().length + ':' + data[i];
		}

		if (comment) {
			packet += '#' + comment;
		}

		packet += "\n";
		self.sp.write(packet);
	};


	self.watchcap = function(sendPin, receivePin) {
		console.log('Sending watchap');
		self.send(self.WATCHCAP, [sendPin, receivePin]);
	};

	self.ping = function() {
		self.send(self.PING, []);
	};
};

util.inherits(capduino, events.EventEmitter);
exports = module.exports = capduino;