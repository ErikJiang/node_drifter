/**
 * Created by jiangink on 15/5/31.
 */
var express = require('express');
var redis = require('./models/redis.js');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//POST owner=xxx&type=xxx&content=xxx[&time=xxx]
app.post('/', function (req, res) {
  if (!(req.body.owner && req.body.type && req.body.content)) {
    if (req.body.type && (["male", "female"].indexOf(req.body.type) === -1)) {
      return res.json({code: 0, msg: "類型錯誤"});
    }
    return res.json({code: 0, msg: "信息不完整"});
  }
  redis.throw(req.body, function (result) {
    res.json(result);
  });
});

//GET /?user=xxx[&type=xxx]
app.get('/', function (req, res) {
  if (!req.query.user) {
    return res.json({code: 0, msg: "信息不完整"});
  }
  if (req.query.type && (["male", "female"].indexOf(req.query.type) === -1)) {
    return res.json({code: 0, msg: "類型錯誤"});
  }
  redis.pick(req.query, function (result) {
    res.json(result);
  });
});

//POST owner=xxx&type=xxx&content=xxx&time=xxx
app.post('/back', function (req, res) {
  redis.throwBack(req.body, function (result) {
    res.json(result);
  });
});

app.listen(3000);