module.exports = function (app) {

    //登录
    app.post('/login.do', function(req, res) {
        if (!req.session.user) {
            req.session.user = {
                name: req.body.name,
                sex: req.body.sex
            };
        }
        res.redirect('/');
    });

    //注销
    app.get('/signout.do', function (req, res) {
        req.session.user = null;
        res.redirect('/');
    });

};
