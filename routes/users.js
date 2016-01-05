module.exports = function (app) {
    /* GET users listing. */
    app.get('/users', function(req, res, next) {
        res.send('respond with a resource');
    });
};
