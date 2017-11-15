#!/usr/bin/env node

var net = require('net');
var path = require('path');
var WebSocketClient = require('websocket').client;
var VERSION = require('./package.json').version;

var argv = process.argv.slice(1);
if (argv.length < 2 || argv.length > 3) {
  help();
  process.exit(-1);
}

var idx = argv[1].lastIndexOf('@');
if (idx === -1) {
  help();
  process.exit(-1);
}

var functionId = argv[1].slice(idx + 1);
var auth = argv[1].slice(0, idx);
var options = {host: '127.0.0.1', port: 8898, backlog: 1};
var wsoptions = {'Cache-Control': 'no-cache', 'Pragma': 'no-cache'};

if (argv.length === 3) {
  idx = argv[2].lastIndexOf(':');
  if (idx === -1) {
    help();
    process.exit(-1);
  }
  options.host = argv[2].slice(0, idx);
  options.port = parseInt(argv[2].slice(idx + 1));
  if (options.host === '*') {
    options.host = '0.0.0.0';
  }
}

function help() {
  console.log([
    'Usage: dbgproxy <user name>:<password>@<FQDN> [<binding host>:<port>]', // TODO: [<affinity cookie>]
    '',
    'Sample:',
    '',
    '    dbgproxy admin:password@my-function.azurewebsites.net',
    '    dbgproxy admin:password@my-function.azurewebsites.net *:8000',
    '    dbgproxy admin:password@my-function.azurewebsites.net 0.0.0.0:8898',
    '    dbgproxy admin:password@my-function.azurewebsites.net 127.0.0.1:8898',
    '    dbgproxy admin:password@my-function.azurewebsites.net localhost:8898',
    '    dbgproxy admin:password@my-function.azurewebsites.net ::1:8898',
    '    dbgproxy admin:password@my-function.azurewebsites.net 0:0:0:0:0:0:0:1:8898',
    '',
  ].join('\r\n'));
  console.log('dbgproxy@' + VERSION, path.resolve(__dirname, 'dbgproxy'));
}

function getWebSocketUriFromFunctionId(functionId) {
  var idx = functionId.indexOf('.');
  if (idx === -1) {
    return 'wss://' + functionId + '.scm.azurewebsites.net' + '/DebugSiteExtension/JavaDebugSiteExtension.ashx';
  }
  return 'wss://' + functionId.slice(0, idx) + '.scm' + functionId.slice(idx) + '/DebugSiteExtension/JavaDebugSiteExtension.ashx';
}

var server = net.createServer();
var wsclient = null;
var wsconnection = null;

function wscleanup() {
  if (wsclient) {
    wsclient.abort();
    wsclient = null;
  }
  if (wsconnection) {
    wsconnection.close();
    wsconnection = null;
  }
}

server.on('connection', function(socket) {
  if (wsclient) {
    console.log('[Server] client rejected', socket.remoteAddress + ':' + socket.remotePort);

    socket.destroy();
    return;
  } else {
    console.log('[Server] client connected', socket.remoteAddress + ':' + socket.remotePort);
    socket.pause();

    wsclient = new WebSocketClient();

    wsclient.on('connect', function(connection) {
      console.log('[WebSocket] client connected');
      wsconnection = connection;

      connection.on('close', function() {
        console.log('[WebSocket] connection closed');
        wscleanup();
        socket.destroy();
      });

      connection.on('error', function(error) {
        console.log('[WebSocket]', error.toString());
        wscleanup();
        socket.destroy();
      });

      connection.on('message', function(message) {
        console.log('[Download]', message.binaryData);
        socket.write(message.binaryData);
      });
      socket.resume();
    });

    wsclient.on('connectFailed', function(error) {
      console.log('[WebSocket]', error.toString());
      wscleanup();
      socket.destroy();
    });

    wsclient.connect(getWebSocketUriFromFunctionId(functionId), null, null, wsoptions, {auth: auth,});
  }

  socket.on('data', function(data) {
    console.log('[Upload]', data);
    wsconnection.send(data);
  });

  socket.on('end', function() {
    console.log('[Server] client disconnected', socket.remoteAddress + ':' + socket.remotePort);
    wscleanup();
  });

  socket.on('error', function(err) {
    console.log('[Server]', err.toString());
    wscleanup();
    socket.destroy();
  });
});

server.on('listening', () => {
  console.log('[Server] listening on', server.address().address + ':' + server.address().port);
});

server.listen(options);
