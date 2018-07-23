var checkoutcard = require('../models/checkoutcard');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var Transaction = require('../models/transaction');
var stripe = require("stripe")("sk_test_mjPvQTYjNImEEt3PTQk3KpbZ");

exports.show = function (req,res){
    var transactionId = req.params.transaction_id;
    sequelize.query('SELECT * FROM Transactions t WHERE t.transactionId = ' + transactionId, { model: Transaction }).then((Transactions) => {
        Transactions[0].offer = Transactions[0].offer * 100;
        res.render('checkoutcard', {
            title: 'Transaction Details',
            data: Transactions[0]
        }
    ).catch((err) => {
        return res.status(400).send({
            message: err
        })
    })
})
}



exports.charge = function(req,res) {
    // Show transaction data
    var transactionId = req.params.transaction_id;
    sequelize.query('SELECT offer FROM Transactions t WHERE t.transactionId = ' + transactionId, { model: Transaction }).then((Transactions) => {

        var amount = 2500;
        console.log(req.body);

        stripe.customers.create({
            email : req.body.stripeEmail,
            source: req.body.stripeToken,
        })
        .then(customer => stripe.charges.create({
            amount,
            description: "Item thingy shit thing",
            currency : "usd",
            customer:customer.id
        }))
        .then(charge=>res.render('success'));
    })
    
    res.redirect('/charge/' + transactionId);
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

