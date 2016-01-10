/**
 * Created by jiangink on 16/1/10.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/drifter', {server: {poolSize: 10}});

//定义漂流瓶模式该要，并设置数据存储到 bottles 集合
var bottleSchema = new mongoose.Schema({
    bottle: Array,
    message: Array
}, {
    collection: 'bottles'
});

//定义漂流瓶模型
var bottleModel = mongoose.model('Bottle', bottleSchema);

//保存漂流瓶数据
exports.save = function(picker, _bottle, callback) {
    var bottle = {bottle: [], message: []};
    bottle.bottle.push(picker);
    bottle.message.push([_bottle.owner, _bottle.time, _bottle.content, _bottle.showDate]);
    var bottleEntity = new bottleModel(bottle);
    bottleEntity.save(function(err) {
        callback(err);
    });
};

//获取用户捡到的所有漂流瓶
exports.getAll = function (user, callback) {
    bottleModel.find({"bottle": user}, function(err, bottles) {
        if(err) {
            return callback({code: 0, msg: '获取漂流瓶列表失败...'});
        }
        callback({code: 1, msg: bottles});
    });
};

//获取特定 ID 的漂流瓶
exports.getOne = function(_id, callback) {
    //通过 ID 获取特定的漂流瓶
    bottleModel.findById(_id, function(err, bottle) {
        if (err) {
            return callback({code: 0, msg: '读取漂流瓶失败...'});
        }
        callback({code: 1, msg: bottle});
    });
};

