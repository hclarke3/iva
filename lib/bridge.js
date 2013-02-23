var eventduino = require('eventduino');

var arduino = new eventduino({ serialport: '/dev/tty.usbserial-A700exlT' });
var PORT0 = eventduino.A0;
var PORT2 = eventduino.A2;
var PORT4 = eventduino.A4;

arduino.on('get', function(args) {
	var voltage = (args[1] / 1024) * 5;
	console.log(args[0]+' '+voltage);

	// Emit the call again.
	setTimeout(function() {
			if(args[0] == 'A0')
				arduino.get(PORT0);
			else if(args[0] == 'A2')
				arduino.get(PORT2);
			else if(args[0] == 'A4')
				arduino.get(PORT4);
	}, 100);
});

arduino.on('init', function(args, comment) {
	arduino.get(PORT0);
	arduino.get(PORT2);
	arduino.get(PORT4);
});