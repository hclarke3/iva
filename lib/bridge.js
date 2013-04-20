var capduino = require('../capduino');
var queue = [	[31,32],
							[33,34],
							[35,36]	];

var arduino = new capduino({
	serialport: '/dev/tty.RN42-DC84-SPP'
});

arduino.on('watchcap', function(args, comment) {
	var obj = {
		key: args[1],
		val: args[0]
	};
	console.log( JSON.stringify(obj) );
});