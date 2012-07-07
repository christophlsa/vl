var redis = require('redis'),
    socketio = require('socket.io'),
    config = require('../../config.js');

global.db = redis.createClient();

global.db._lmove = function(item, sourceKey, destinationKey, destinationPosition, callback) {
	db.lrem(sourceKey, 0, item, function(err) {
		db.lindex(destinationKey, destinationPosition, function(err, elem) {
			if (elem) {
				db.linsert(destinationKey, "BEFORE", elem, item, function(err) {
					if (callback) callback();
				})
			} else {
				db.rpush(destinationKey, item, function(err) {
					if (callback) callback();
				})
			}
		});
	});
}

exports.socketIoStore = new socketio.RedisStore({ redisPub: config.redis, redisSub: config.redis, redisClient: config.redis });

exports.beamer = require('./beamer.js');
exports.agenda = require('./agenda.js');
exports.timers = require('./timers.js');
exports.applications = require('./applications.js');
exports.appcategorys = require('./appcategorys.js');
exports.pollsites = require('./pollsites.js');
