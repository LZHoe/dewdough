var Transaction = require('../models/transaction');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;

exports.show = (req, res) => {
    res.render('checkout');
}

exports.showDetails = function(req,res) {
    // Show transaction data
    var transactionId = req.params.transaction_id;
    sequelize.query('SELECT * FROM Transactions t INNER JOIN itemlists il ON t.listingId = il.Itemid  WHERE t.transactionId = ' + transactionId, { model: Transaction }).then((Transactions) => {
        console.log(Transactions);
        
        Transactions[0].offer = Transactions[0].offer * 100;
        res.render('checkout', {
            image : Transaction.imagename,
            title: 'Transaction Details',
            data: Transactions[0]
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

