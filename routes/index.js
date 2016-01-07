var usrRouter = require('./users');
var redis = require('../models/redis');

module.exports = function(app) {
    /* GET home page. */
    app.get('/', function(req, res, next) {
        res.render('index', { title: 'Express' });
    });
/*
    app.post('/', function (req, res) {
        if (!(req.body.owner && req.body.type && req.body.content)) {
            return res.json({code: 0, msg: '信息不完整.'});
        }
        if (req.body.type && (['male', 'female'].indexOf(req.body.type) === -1)) {
            return res.json({code: 0, msg: '类型错误.'});
        }
        redis.throw(req.body, function(result) {
            res.json(result);
        });
    });

    app.get('/', function (req, res) {
        if (!req.query.user) {
            return res.json({code: 0, msg: '信息不完整.'});
        }
        if (req.query.type && (['male', 'female'].indexOf(req.query.type) === -1)) {
            return res.json({code: 0, msg: '类型错误.'});
        }
        redis.pick(req.query, function(result) {
            res.json(result);
        });
    });
*/
    //user routes handler
    usrRouter(app);
};