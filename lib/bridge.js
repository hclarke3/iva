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

/*arduino.on('ok', function() {
	if (queue.length > 0) {
		var v = queue.shift();
		console.log(v);
		arduino.watchcap(v[0], v[1]);
	}
});*/

arduino.on('pong', function() {
	arduino.watchcap(31,32);
	arduino.watchcap(33,34);
	arduino.watchcap(35,36);
});

setTimeout((function() {
	arduino.ping()
}), 5000);
