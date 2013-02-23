var eventduino = require('eventduino');

var arduino = new eventduino({ serialport: '/dev/tty.usbserial-A700exlT' });

arduino.on('get', function(args) {
	var voltage = (args[1] / 1024) * 5;
	console.log(voltage);

	// Emit the call again.
	setTimeout(function() {
			arduino.get(eventduino.A0)
	}, 100);
});

arduino.on('init', function(args, comment) {
	arduino.get(eventduino.A0);
});