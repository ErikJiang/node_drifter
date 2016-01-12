var usrRouter = require('./users');
var redis = require('../models/redis');
var mongo = require('../models/mongodb');

module.exports = function(app) {
    /* GET home page. */
    app.get('/', function(req, res, next) {
        if (!req.session.user) {
            res.render('index', {pageType: 'login'});
        }
        else{
            res.render('index', {
                pageType: 'main',
                user: req.session.user,
                data: null
            });
        }

    });

    //扔瓶子
    app.post('/throw.do', function (req, res) {
        if (!(req.body.owner && req.body.type && req.body.content)) {
            return res.json({code: 0, msg: '信息不完整.'});
        }
        if (req.body.type && (['0', '1'].indexOf(req.body.type) === -1)) {
            return res.json({code: 0, msg: '类型错误.'});
        }
        redis.throw(req.body, function(result) {
            res.json(result);
        });
    });

    //捡瓶子
    app.get('/pick.do', function (req, res) {
        if (!req.query.user) {
            return res.json({code: 0, msg: '信息不完整.'});
        }
        if (req.query.type && (['0', '1'].indexOf(req.query.type) === -1)) {
            return res.json({code: 0, msg: '类型错误.'});
        }
        redis.pick(req.query, function(result) {
            if (result.code === 1) {
                mongo.save(req.query.user, result.msg, function(err, product) {
                    if (err) {
                        return res.json({code: 0, msg: '获取漂流瓶失败，请重试'});
                    }
                    console.log("product>>: ", product);
                    return res.json(result);
                });
            }
            else {
                res.json(result);
            }
        });
    });

    //获取一个用户的所有漂流瓶
    app.get('/listInfo.do', function(req, res) {
        mongo.getAll(req.session.user.name, function(result) {
            res.json(result);
        });
    });

    //获取单一的漂流瓶信息
    app.get('/bottleInfo.do', function (req, res) {
        mongo.getOne(req.query.id, function(result) {
            res.json(result);
        });
    });

    //删除特定 ID 的漂流瓶
    app.get('/delete.do', function (req, res) {
        mongo.delete(req.query.id, function (result) {
            res.json(result);
        });
    });

    //user routes handler
    usrRouter(app);
};