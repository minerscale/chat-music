const fs = require('fs');
const https = require('https');
const WSServer = require('ws').Server;
const path = require('path');

const port = 8443;

const start = Date.now();

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
        case '.wasm':
            contentType = 'application/wasm';
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
                response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
                response.end(); 
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
};

const options = {
    key: fs.readFileSync('../server/cert/CA/cloudflare/cloudflare.key'),
    cert: fs.readFileSync('../server/cert/CA/cloudflare/cloudflare.crt')
};

const server = https.createServer(options);

const wss = new WSServer({
    server: server
});

server.on('request', httpsListener);

wss.on('connection', function connection(ws) {
    console.log("recieved connection!")
    ws.on('message', function incoming(message) {
        console.log((Date.now() - start) +':'+message);
        wss.clients.forEach(function(client) {
            var message_clean = String(message).slice(0,51).trim();
            if (message_clean) client.send(message_clean);
        });
    });
});

server.listen(port, function() {
    console.log(`https/ws server listening on ${port}`);
});
