$(function() {
	var socket = io.connect('http://localhost');
	socket.on('data', function (data) {
		$('body').prepend('<p>'+data+'</p>');
	});
});