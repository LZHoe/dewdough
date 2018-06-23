var Test = require('../models/test');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;

// Show
exports.show = function(req,res) {
    // Show test data
    sequelize.query('SELECT * FROM Test', { model: Test }).then((test) => {
        res.render('test', {
            title: 'Showing test data',
            data: test
            // urlPath: req.protocol + "://" + req.get("host") + req.url
        })
    }).catch((err) => {
        return res.status(400).send({
            message: err
        })
    })
}

// Comments authorisation middleware
exports.hasAuthorization = function (req,res,next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}