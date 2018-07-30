var Question = require('../models/question');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var flash = require('connect-flash');

exports.create = function (req, res) {

        // retreive user input
        var questiondata = {
            name : req.body.name,
            email: req.body.email,
            question: req.body.question,
        };

        // after retreiving, push into db
        Question.create(questiondata).then((newquestion, created) => {
            if (!newquestion) {
                return res.send(400, {
                    message: "error"
                });
            }
            console.log("New transaction successful");
            res.redirect('/');
        })
        }
    