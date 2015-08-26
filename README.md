bunyan-redis
============

### What's changed in this fork
* reduced ops by reusing results from `push` command
* optimized trimming by applied drop factor
* only accept well-initialized redis-client

Installation
========
```bash
npm install bunyan-redis
```

Usage
========

With existing redis client connection.

```javascript
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
```

And with connection data.

Options
========
* client - redis client instance
* container - redis key
* length: maximum size of log queue
* drop_factor (optional): by which overflown logs are dropped, default = 0
