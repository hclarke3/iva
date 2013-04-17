$(function() {
	var socket = io.connect('http://localhost');
	socket.on('data', function (packet) {
		var par = document.createElement('p');
		$(par).append(packet.key+': '+packet.val);
		$('body').prepend(par);
	});
});