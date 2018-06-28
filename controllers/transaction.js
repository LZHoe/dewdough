var Transaction = require('../models/transaction');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;

// Show
exports.showAll = function(req,res) {
    // Show transaction data
    sequelize.query('SELECT transactionId, createdAt FROM Transactions', { model: Transaction }).then((Transactions) => {
        res.render('allTransactions', {
            title: 'All Transactions',
            data: Transactions
        })
    }).catch((err) => {
        return res.status(400).send({
            message: err
        })
    })
}

exports.showDetails = function(req,res) {
    // Show transaction data
    var transactionId = req.params.transaction_id;
    sequelize.query('SELECT * FROM Transactions t WHERE t.transactionId = ' + transactionId, { model: Transaction }).then((Transactions) => {
        res.render('transactionsDetails', {
            title: 'Transaction Details',
            data: Transactions[0]
        })
    }).catch((err) => {
        return res.status(400).send({
            message: err
        })
    })
}

exports.create = function (req,res) {
    console.log("Creating new transaction: " + req.body.offer);

    var transactionData = {
        qty: req.body.qty,
        offer: req.body.offer,
        listingId: req.body.listingId,
        buyerId: req.body.buyerId
    };

    Transaction.create(transactionData).then((newTransaction, created) => {
        if (!newTransaction) {
            return res.send(400, {
                message: "error"
            });
        }

        console.log("New transaction successful");
        res.redirect('/transactions');
    });
}

exports.testpay = function(req,res) {
    var updateData = {
        status: 'Delivering',
        paymentId: 'some_payment_id',
        paymentMethod: 'Paypal'
    }
    transactionId = req.params.transaction_id;
    Transaction.update(updateData, { where: { transactionId: transactionId } }).then((updatedRecord) => {
        if (!updatedRecord || updatedRecord == 0) {
            return res.send(400, {
                message: "error"
            });
        }
        res.redirect('/transactions/' + transactionId);
    });
}

// Authorisation middleware
exports.hasAuthorization = function (req,res,next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}