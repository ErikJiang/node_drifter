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

//检查用户是否超出扔瓶次数的限制
function checkThrowTimes(owner, callback) {
    pool.acquire(function (err, client) {
        if (err) {
            return callback({code: 0, msg: err});
        }
        //到2号数据库检查用户是否超过扔瓶次数限制
        client.SELECT(2, function() {
            //获取该用户的扔瓶次数
            client.GET(owner, function(err, result) {
                if(result >= 10) {
                    return callback({code: 0, msg: '今天扔瓶次数已用完'});
                }
                //扔瓶次数加1
                client.INCR(owner, function() {
                    client.TTL(owner, function(err, ttl) {
                        //检查当天是否为第一次扔瓶子
                        if(ttl === -1){
                            //是第一次扔，则扔瓶次数键的生命期为1天
                            client.EXPIRE(owner, 86400, function() {
                                pool.release(client);
                            });
                        }
                        else {
                            //已扔过瓶子，则保持原有生命期不变
                            pool.release(client);
                        }
                        callback({code: 1, msg: ttl});
                    });
                });
            });
        });
    });
}

function throwOneBottle(bottle, callback) {
    bottle.time = bottle.time || Date.now();
    var bottleId = uuid.v4();
    //var type = {male: 0, female: 1};
    pool.acquire(function (err, client) {
        if(err) {
            return callback({code: 0, msg: err});
        }
        client.SELECT(bottle.type, function(){
            client.HMSET(bottleId, bottle, function (err, result) {
                if(err) {
                    return callback({code: 0, msg: '过会儿再试试吧！'});
                }
                client.PEXPIRE(bottleId, 86400000+bottle.time-Date.now(), function () {
                    pool.release(client);
                });
                callback({code: 1, msg: result});
            });
        });
    });
}

//检查用户是否超出捡瓶次数限制
function checkPickTimes(owner, callback) {
    pool.acquire(function(err, client) {
        if (err) {
            return callback({code: 0, msg: err});
        }
        //到 3 号数据库检查用户是否超过捡瓶次数限制
        client.SELECT(3, function() {
            client.GET(owner, function(err, result) {
                if (result >= 10) {
                    return callback({code: 0, msg: '今天捡瓶次数已用完'});
                }
                //捡瓶次数加1
                client.INCR(owner, function () {
                   // 检测是否为当天第一次捡瓶
                   client.TTL(owner, function(err, ttl) {
                       if (ttl === -1) {
                           //是第一次，则设置生命期为1天
                           client.EXPIRE(owner, 86400, function() {
                               pool.release(client);
                           });
                       }
                       else{
                           //不是，则维持之前的生命期不变
                           pool.release(client);
                       }
                       callback({code: 1, msg: ttl});
                   });
                });
            });
        });
    });
}

function pickOneBottle(info, callback){
    //var type = {all: Math.round(Math.random()), male: 0, female: 1};
    //info.type = info.type || 'all';
    pool.acquire(function (err, client) {
        if(err) {
            return callback({code: 0, msg: err});
        }

        client.SELECT(info.type, function () {
            client.RANDOMKEY(function (err, bottleId) {
               if(err) {
                   return callback({code: 0, msg: err});
               }
               if(!bottleId) {
                   return callback({code: 2, msg: '恭喜你捞到一只派大星！'});
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
    checkThrowTimes(bottle.owner, function(result) {
        if(result.code === 0) {
            return callback(result);
        }
        throwOneBottle(bottle, function(result) {
            callback(result);
        });
    });
};

exports.pick = function (info, callback) {
    checkPickTimes(info.user, function(result) {
        if(result.code === 0) {
            return callback(result);
        }
        //20%概率捡到海星
        if (Math.random() <= 0.2) {
            return callback({code: 2, msg: '恭喜你捞到一只派大星！'});
        }
        pickOneBottle(info, function(result) {
            callback(result);
        });
    });
};
