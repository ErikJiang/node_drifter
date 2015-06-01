/**
 * Created by jiangink on 15/6/1.
 */

var redis = require('redis'),
    client = redis.createClient(),
    client_t = redis.createClient(),
    client_p = redis.createClient();


exports.throw = function (bottle, callback) {
  client_t.SELECT(2, function () {
    client_t.GET(bottle.owner, function (err, result) {
      if (result >= 10) {
        return callback({code: 0, msg: "今日仍瓶子的機會已用完⋯⋯"});
      }

      client_t.INCR(bottle.owner, function () {
        client_t.TTL(bottle.owner, function (err, ttl) {
          if (ttl === -1) {
            client_t.EXPIRE(bottle.owner, 86400);
          }
        });
      });

      bottle.time = bottle.time || Date.now();
      var bottleId = Math.random().toString(16);
      var type = {male: 0, female: 1};
      client.SELECT(type[bottle.type], function () {
        client.HMSET(bottleId, bottle, function (err, result) {
          if (err) {
            return callback({code: 0, msg: "過會兒再試試吧！"});
          }
          callback({code: 1, msg: result});
          client.EXPIRE(bottleId, 86400);
        });
      });

    });
  });
}

exports.pick = function (info, callback) {
  client_p.SELECT(3, function () {
    client_p.GET(info.user, function (err, result) {
      if (result >= 10) {
        return callback({code: 0, msg: "今日撿瓶子的機會已用完⋯⋯"});
      }

      client_p.INCR(info.user, function () {
        client_p.TTL(info.user, function (err, ttl) {
          if (ttl === -1) {
            client_p.EXPIRE(info.user, 86400);
          }
        });
      });

      if (Math.random() <= 0.2) {
        return callback({code: 0, msg: "海星"});
      }

      var type = {all: Math.round(Math.random()), male: 0, female: 1};
      info.type = info.type || 'all';
      client.SELECT(type[info.type], function () {
        client.RANDOMKEY(function (err, bottleId) {
          if (!bottleId) {
            return callback({code: 0, msg: "海星"});
          }
          client.HGETALL(bottleId, function (err, bottle) {
            if (err) {
              return callback({code: 0, msg: "漂流瓶破損了⋯⋯"});
            }
            callback({code: 0 , msg: bottle});
            client.DEL(bottleId);
          });
        });
      });

    });
  });
}

exports.throwBack = function (bottle, callback) {
  var type = {male: 0, female: 1};
  var bottleId = Math.random().toString(16);
  client.SELECT(type[bottle.type], function () {
    client.HMSET(bottleId, bottle, function (err, result) {
      if (err) {
        return callback({code: 0, msg: "過會兒再試試吧！"});
      }
      callback({code: 1, msg: result});
      client.PEXPIRE(bottleId, bottle.time + 86400000 - Date.now());
    });
  });
}