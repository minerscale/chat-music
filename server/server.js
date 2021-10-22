const fs = require('fs');
//const https = require('https');
http = require('http');
const path = require('path');
const net = require('net');
const WebSocketServer = require('ws').WebSocketServer;

const host = '0.0.0.0';
const https_port = 8080;
const wss_port = 9000;

const options = {
  key: fs.readFileSync('../server/cert/CA/localhost/localhost.decrypted.key'),
  cert: fs.readFileSync('../server/cert/CA/localhost/localhost.crt')
};

const httpsListener = function (request, response) {
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.png':
            contentType = 'image/png';
            break;
    }

    fs.readFile(filePath, function(error, content) {
        if (error) {
            console.log(error);
            if(error.code == 'ENOENT'){
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end(); 
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
};

//const https_server = https.createServer(options, httpsListener);
const https_server = http.createServer(httpsListener);
https_server.listen(https_port, host, () => {
    console.log(`Server is running on https://${host}:${https_port}`);
});

//const server = https.createServer(options);
const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    wss.clients.forEach(function(client) {
        client.send(String(message))
    });
  });
});

server.listen(9000);
