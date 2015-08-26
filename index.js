'use strict';

var vasync = require('vasync');
var events = require('events');
var stringify = require('json-stringify-safe');

/**
 * Create a new RedisTransport instance
 *
 * @param {Object} opts Transport options object
 * @param {String} opts.container Redis key
 * @param {Number} opts.length List max length
 * @param {Object} opts.client Redis client instance
 * @param {String} opts.password Redis password
 * @param {Number} opts.drop_factor, by which overflown items are dropped
 * @param {Boolean} opts.diagnosis, enable diagnosis mode, which may insert some info into redis
 * @constructor
 */
function RedisTransport (opts) {

  if(!opts.client || !opts.container || !opts.length) {
	  throw "client, container and length are required fields";
  }
  this._container = opts.container;
  this._length = opts.length;
  this._client = opts.client;
  this._drop_factor = opts.drop_factor || 0;
  this._diagnosis = opts.diagnosis || false;
}

RedisTransport.prototype = Object.create(events.EventEmitter.prototype);

/**
 * Push bunyan log entry to redis list
 *
 * @param {Object} entry
 */
RedisTransport.prototype.write = function write (entry) {
  var self = this;
  var client = this._client;

  this.emit('log', entry);

  vasync.pipeline({
    arg: {},
    funcs: [
      // Push data
      function pushEntryToList (args, next) {
        var data = stringify(entry, null, 2);
        client.lpush(self._container, data, function dataStored (err, len) {
          if (err) {
            return next(err);
          }

          args.length = len;

          return next();
        });
      },

      // Trim data list
      function trimList (args, next) {
        if (self._length === undefined || args.length <= self._length) {
          return next();
        }

        var after_len = Math.ceil(self._length * (1- self._drop_factor));

        self.emit('trim','current length:'+args.length+' after trimming length:'+after_len);

        args.trimmed = true;

        client.ltrim(self._container, 0, after_len, function dataStored (err) {
          if (err) {
            return next(err);
          }

          return next();
        });
      },

      //diagnosis
      function report (args, next) {
        if(self._diagnosis && args.trimmed)
        {
          var hash_name = 'stat:trim';
          var field_name = self._container;
          client.hincrby(hash_name, field_name, 1, function(err){
            if(err)
            {
              return next(err);
            }else
            {
              return next();
            }
          });
        }else
        {
          return next();
        }
      }
    ]
  }, function onEnd (err, results) {
    if (err) {
      return self.emit('error', err);
    }

    self.emit('logged', entry);
  });
};

module.exports = RedisTransport;