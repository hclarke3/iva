
/**
* Module dependencies.
*/

var express = require('express'),
    http = require('http'),
    path = require('path'),
    socketio = require('socket.io'),
    spawn = require('child_process').spawn,
    capduino = require('./capduino');

var app = express();
var threshold = 200;

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.engine('html', require('ejs').renderFile);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

var arduino = new capduino({
    serialport: '/dev/tty.RN42-DC84-SPP'
});

app.get('/', function(req, res) {
  res.render('index.html');
});

app.get('/checklist', function(req, res) {
    res.render('checklist.html');
});

app.get('/telecom', function(req, res) {
    res.render('telecom.html');
});

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

var io = socketio.listen(server);

io.sockets.on('connection', function (socket) {
    var cache = packet = {};
    var oldval = null;
    var s1lock = true;
    var s2lock = true;
    var s3lock = true;
    var action = '';
    arduino.on('watchcap', function(args, comment) {
        packet = {
            key: args[1],
            val: args[0]
        };
        console.log(packet);
        oldVal = cache[packet.key];
        if (oldVal && packet.val - oldVal > threshold) {
            if (packet.key === 's3' && s3lock) {
                action = 'left';
                s3lock = false;
            } else if (packet.key === 's2' && s2lock) {
                action = 'select';
                s2lock = false;
            } else if (packet.key === 's1' && s1lock) {
                action = 'right';
                s1lock = false;
            }

            if (!s3lock && !s2lock && !s1lock) {
                action = 'home';
            }

            socket.emit('action', action);
        }

        if (oldVal && packet.val - oldVal < threshold){
            if (packet.key === 's3') {
                s3lock = true;
            } else if (packet.key === 's2') {
                s2lock = true;
            } else if (packet.key === 's1') {
                s1lock = true;
            }
        }

        cache[packet.key] = packet.val;
    });
});
