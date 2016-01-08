var usrRouter = require('./users');
var redis = require('../models/redis');

module.exports = function(app) {
    /* GET home page. */
    app.get('/', function(req, res, next) {
        res.render('index');
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
            res.json(result);
        });
    });

    //user routes handler
    usrRouter(app);
};