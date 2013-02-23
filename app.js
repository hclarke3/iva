
/**
* Module dependencies.
*/

var express = require('express')
    , routes = require('./routes')
    , http = require('http')
    , path = require('path')
    , socketio = require('socket.io')
    , spawn = require('child_process').spawn;

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
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

var proc = spawn('node',['./lib/bridge.js']);

app.get('/', routes.index);

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

var io = socketio.listen(server);

io.sockets.on('connection', function (socket) {
    proc.stdout.on('data', function(data) {
        var rawdata = data.toString('utf8', 0, data.length-1)
        var ports = rawdata.split('\n');
        var ret = [];
        for (idx in ports) {
            ret.push(ports[idx].split(' '));
        }
        console.log(ret);
    });
});
