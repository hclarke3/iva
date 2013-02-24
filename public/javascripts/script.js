$(function() {
	var socket = io.connect('http://localhost');
	socket.on('data', function (data) {
		var par = document.createElement('p');
		for (d in data) {
			$(par).append(data[d]+', ');
		}
		$('body').prepend(par);
	});
});