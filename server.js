var fs = require('fs');
var http = require('http');

// Serve client side statically
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
var uuid = require('uuid');
//var gm = require('gm').subClass({ imageMagick: true });
var gm = require('gm');

//var im = require("imagemagick");

var server = http.createServer(app);

// Start Binary.js server
var BinaryServer = require('binaryjs').BinaryServer;
var bs = BinaryServer({
    server: server
});

app.use(function (req, res, next) {
    console.log("setting access control info");
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


// Wait for new user connections
bs.on('connection', function (client) {
    // Incoming stream from browsers
    client.on('stream', function (stream, meta) {
        console.log(meta.name);
        var uniqueName = uuid.v1();
        var filename = uniqueName + meta.name;
        var file = fs.createWriteStream(__dirname + '/public/' + filename);
        stream.pipe(file);

        stream.on('end', function (data) {
            console.log("ended");
            stream.write({
                status: 'success',
                name: filename
            });
        });

        // Send progress back
        stream.on('data', function (data) {
            stream.write({
                rx: data.length / meta.size
            });

        });

    });
});

server.listen(9000);
console.log('HTTP and BinaryJS server started on port 9000');
