/**
 * Created by jiangink on 16/1/5.
 */
var redis = require('redis');
var uuid = require('node-uuid');            //生成唯一ID
var poolModule = require('generic-pool');   //Redis连接池创建与管理

var pool = poolModule.Pool({
    name: 'redisPool',
    create: function(callback) {
        var client = redis.createClient();
        callback(null, client);
    },
    destroy: function(client) {
        client.quit();
    },
    max: 100,
    min: 5,
    idleTimeoutMillis: 30000,
    log: true
});

function throwOneBottle(bottle, callback) {
    bottle.time = bottle.time || Date.now();
    var bottleId = uuid.v4();
    var type = {male: 0, female: 1};
    pool.acquire(function (err, client) {
        if(err) {
            return callback({code: 0, msg: err});
        }
        client.SELECT(type[bottle.type], function(){
            client.HMSET(bottleId, bottle, function (err, result) {
                if(err) {
                    return callback({code: 0, msg: '过会儿再试试吧！'});
                }
                client.EXPIRE(bottleId, 86400, function () {
                    pool.release(client);
                });
                callback({code: 1, msg: result});
            });
        });
    });
}

function pickOneBottle(info, callback){
    var type = {all: Math.round(Math.random()), male: 0, female: 1};
    info.type = info.type || 'all';
    pool.acquire(function (err, client) {
        if(err) {
            return callback({code: 0, msg: err});
        }

        client.SELECT(type[info.type], function () {
            client.RANDOMKEY(function (err, bottleId) {
               if(err) {
                   return callback({code: 0, msg: err});
               }
               if(!bottleId) {
                   return callback({code: 0, msg: '大海空空如也……'});
               }
               client.HGETALL(bottleId, function(err, bottle) {
                   if (err) {
                       return callback({code: 0, msg: '漂流瓶破损了……'});
                   }
                   client.DEL(bottleId, function(){
                       pool.release(client);
                   });
                   callback({code: 1, msg: bottle});
               });
            });
        })
    });
}

exports.throw = function(bottle, callback) {
    throwOneBottle(bottle, function(result) {
        callback(result);
    });
};

exports.pick = function (info, callback) {
    pickOneBottle(info, function(result) {
        callback(result);
    });
};