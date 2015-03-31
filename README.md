Bunyan redis transport
============

This is a fork of [bunyan-redis](https://github.com/harrisiirak/bunyan-redis), with some addtional features and improvements.


What are extras of this fork
============
* Support for lazy trimming, once the buffer reach limits, rather than a single record, a portion of records will be trimmer in order to reduce the number of times of trimming.
* Diagnosis info for trimming, an optional mode for record info about trimming in redis `stat:trim` key
* Reuse the length of LPUSH result directly instead of making explict command to get.



Installation
========
```bash
npm install bunyan-redis
```

Usage
========

With existing redis client connection.

```javascript
var bunyan = require('bunyan')
//normal client
var client = require('redis').createClient(); 

//sentinel client
var client = require('redis-sentinel').createClient(
[
    {host: 'SENTINEL_HOST_1', port: PORT},
    {host: 'SENTINEL_HOST_2', port: PORT}
],
masterName, 
opts)
);


var transport = new RedisTransport({
  container: 'YOUR_LOG_KEY',
  client: client,
  db: DB_INDEX
});

var logger = bunyan.createLogger({
  name: 'bunyan-redis',
  streams: [{
    type: 'raw',
    level: 'trace',
    stream: transport,
    length: 10000,
    drop_factor: 0.1
  }]
});
```

And with connection data.

Options
========
* host - redis hostname
* port - redis port
* db - redis database index
* password - redis password
* client - redis client instance
* container - redis key
* length: maximum size of log queue
* drop_factor (optional): by which overflown logs are dropped, default = 0
