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
    bottle.message.push([_bottle.owner, _bottle.time, _bottle.type, _bottle.content, _bottle.showDate]);
    var bottleEntity = new bottleModel(bottle);
    bottleEntity.save(function(err, data) {
        callback(err, data);
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

//删除特定 ID 的漂流瓶
exports.delete = function (id, callback) {
    //通过 ID 查找并删除漂流瓶
    bottleModel.findByIdAndRemove(id, function (err) {
        if(err) {
            return callback({code: 0, msg: "删除漂流瓶失败..."});
        }
        callback({code: 1, msg: "删除成功！"});
    });
};

// 回复特定 ID 的漂流瓶
exports.reply = function(id, reply, callback) {
    reply.time = reply.time || Date.now();
    // 通过 ID 找到要回复的漂流瓶
    bottleModel.findById(id, function(err, _bottle) {
        if (err) {
            return callback({code: 0, msg: "回复漂流瓶失败..."});
        }
        var newBottle = {};
        newBottle.bottle = _bottle.bottle;
        newBottle.message = _bottle.message;
        // 如果捡瓶子的人第一次回复漂流瓶，则在 bottle 键添加漂流瓶主人
        if (newBottle.bottle.length === 1) {
            newBottle.bottle.push(_bottle.message[0][0]);
        }
        // 在 message 键添加一条回复信息
        newBottle.message.push([reply.user, reply.time, reply.content, reply.showDate]);
        // 更新数据库中该漂流瓶信息
        bottleModel.findByIdAndUpdate(id, newBottle, function (err, bottle) {
            if(err) {
                return callback({code: 0, msg: "回复漂流瓶失败..."});
            }
            //成功时返回更新后的漂流瓶信息
            callback({code: 1, msg: bottle});
        });
    });
};