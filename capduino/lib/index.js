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

		case self.WATCHCAP:
			self.emit('watchcap', args, comment);
			break;

		default:
			console.log("default: " + command + " => " + data);
			//self.send(self.ERROR, [ "Unknown Command", command ]);
		}
	};
};

util.inherits(capduino, events.EventEmitter);
exports = module.exports = capduino;