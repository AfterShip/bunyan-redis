/**
 * Created by FeikoLai on 5/1/15.
 */

var ioredis = require('ioredis');
var client = new ioredis({
	port: 6379,          // Redis port
	host: '127.0.0.1',   // Redis host
	db:15
});
var RedisTransport = require('../');
var bunyan = require('bunyan');

transport = new RedisTransport({
	container: 'logs:foo',
	client: client,
	drop_factor: 0.25,
	length:10,
	diagnosis: true
});

logger = bunyan.createLogger({
	name: 'name',
	streams: [{
		type: 'raw',
		level: 'trace',
		stream: transport
	}]
});

client.on('error', function (e) {
	console.error("client error",e);
});

transport.on('error', function (e) {
	console.error("transport error",e);
});

transport.on('logged', function (item) {
	console.log('logged');
});

transport.on('trim', function (item) {
	console.log('trim', item);
});


setInterval(function () {
	logger.info('foo' + new Date());
}, 500);
