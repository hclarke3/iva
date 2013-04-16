var capduino = require('../capduino/lib/index.js');

var arduino = new capduino({
	serialport: '/dev/tty.usbserial-A700exlT',
	baudrate: 9600
});

arduino.on('watchcap', function(args, comment) {
	console.log(args);
});

arduino.on('init', function(args, comment) {
	console.log('initialized');
	arduino.watchcap(31,33);
});