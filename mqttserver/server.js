var mosca = require('mosca');
//var Auth0Mosca = require('auth0mosca');
var Connection = require('tedious').Connection;  
 
var settings = {
  host: 'a64a3d777db44c70978e098646b0b768.s2.eu.hivemq.cloud',
  port: 8883,
  protocol: 'mqtts',
  username: 'turcoUser',
  password: 'trs_Dhf245'
};

var server = new mosca.Server(settings);

server.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});

server.on('clientDisconnected', function(client) {
    console.log('client  Disconnected', client.id);
});


// fired when a message is received
server.on('published', function(packet, client) {
  console.log(packet);
  console.log('Published', packet.payload.toString());
});

server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');
}