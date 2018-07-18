var checkoutcard = require('../models/checkoutcard');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;


exports.show = function (req,res){
    res.render("checkoutcard")
}

exports.create = function (req,res) {
    console.log("Creating new Card: " + req.body.offer);

    var checkoutcarddata = {
        cardnumber: req.body.cardnumber,
        expiry: req.body.expiry,
        cardname: req.body.cardname,
        cardcode: req.body.cardcode
    };

    checkoutcard.create(checkoutcarddata).then((newCard, created) => {
        if (!newCard) {
            return res.send(400, {
                message: "error"
            });
        }

        console.log("Card Saved");
        res.redirect('/success');
    });
}
