var Transaction = require('../models/transaction');
var TransactionLog = require('../models/transactionLog');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var itemlists = require('../models/itemlist')
var moment = require('moment');

// function to convert date from sql to more readable format using moment js
function convertDate (myDate) {
    var dateObj = moment(myDate);
    var newDate = moment(dateObj).calendar();
    return newDate;
}

//////////////////////////////////////
//// List all orders/transactions ////
//////////////////////////////////////
exports.showAll = function (req, res) {
    // Join transactions & item listing table
    sequelize.query('SELECT transactionId, listingId, t.createdAt, t.updatedAt, offer, ItemName, imageName \
                    FROM Transactions t \
                    INNER JOIN itemlists il ON t.listingId = il.Itemid \
                    WHERE buyerId = ' + req.user.id +
                    ' ORDER BY t.createdAt', { type: sequelize.QueryTypes.SELECT }).then((Transactions) => {
            // formatting dates
            for (var i=0; i<Transactions.length; i++) {
                Transactions[i].createdAt = convertDate(Transactions[i].createdAt);
                Transactions[i].updatedAt = convertDate(Transactions[i].updatedAt);
            }
            res.render('allTransactions', {
                title: 'Order History',
                data: Transactions
            })
        }).catch((err) => {
            return res.status(400).send({
                message: err
            })
        })
}

/////////////////////////////////////////
//// List details of ONE transaction ////
/////////////////////////////////////////
exports.showDetails = function (req, res) {
    // Show transaction data
    var transactionId = req.params.transaction_id;
    sequelize.query('SELECT * FROM Transactions t WHERE t.transactionId = ' + transactionId, { model: Transaction }).then((Transactions) => {
        sequelize.query(`SELECT tl.updatedAt, qty, offer, username, action 
        FROM TransactionLogs tl 
        INNER JOIN Users u ON u.id = tl.commitBy 
        WHERE transactionId = :transaction_id `, {
            replacements: {
                transaction_id: transactionId
            },
            type: sequelize.QueryTypes.SELECT
        }).then((TransactionLogs) => {
            // formatting dates
            for (var i=0; i<TransactionLogs.length; i++) {
                TransactionLogs[i].updatedAt = convertDate(TransactionLogs[i].updatedAt);
            }
            res.render('transactionsDetails', {
                title: 'Transaction Details',
                data: Transactions[0],
                logData: TransactionLogs
            })
        }).catch((err) => {
            return res.status(400).send({
                message: err
            })
        })
    }).catch((err) => {
        return res.status(400).send({
            message: err
        })
    })
}

////////////////////////////////////////////////
//// Start a transaction with initial offer ////
////////////////////////////////////////////////
exports.create = function (req, res) {
    var initialPrice = 0;
    sequelize.query("SELECT price FROM itemlists WHERE Itemid = :listingid", { replacements: { listingid: req.body.listingId }, model: itemlists }).then((results) => {

        // retreive user input
        var transactionData = {
            qty: req.body.qty,
            listingId: req.body.listingId,
            buyerId: req.user.id,
            offer: results[0].price
        };

        // after retreiving, push into db
        Transaction.create(transactionData).then((newTransaction, created) => {
            if (!newTransaction) {
                return res.send(400, {
                    message: "error"
                });
            }

            console.log("New transaction successful");
            res.redirect('/transactions');
        });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        })
    })
}

/////////////////
//// Payment ////
/////////////////
exports.testpay = function (req, res) {
    var updateData = {
        status: 'Delivering',
        paymentId: 'some_payment_id',
        paymentMethod: 'Paypal'
    }
    transactionId = req.params.transaction_id;
    Transaction.update(updateData, { where: { transactionId: transactionId }, id: req.user.id, action: 'PAID' }).then((updatedRecord) => {
        if (!updatedRecord || updatedRecord == 0) {
            return res.send(400, {
                message: "error"
            });
        }
        res.redirect('/transactions/' + transactionId);
    });
}

// Authorisation middleware
exports.hasAuthorization = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}