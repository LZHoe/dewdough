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

// function given user id and transaction id, if user is buyer
exports.isBuyer = function (req, res, next) {
    var tId = req.params.transaction_id;
    var uId = req.user.id;
    sequelize.query('SELECT buyerId FROM Transactions WHERE transactionId = :tId', { model: Transaction, replacements: { tId: tId } }).then((Transactions) => {
        if (Transactions[0].buyerId == uId) {
            console.log("isbuyer...");
            res.locals.isBuyer = true;
        } 
        else {
            res.locals.isBuyer = false;
        }
        return next();
    })
}

//////////////////////////////////////
//// List all orders/transactions ////
//////////////////////////////////////
exports.showAll = function (req, res) {
    // Join transactions & item listing table
    if (req.query.view == 'selling') {
        sequelize.query(`SELECT transactionId, listingId, seller.id sellerId, buyerId, t.createdAt, t.updatedAt, t.status, offer, ItemName, imageName, 
                        seller.username sellerUser, buyer.username buyerUser, buyerReady, sellerReady 
                        FROM Transactions t 
                        INNER JOIN itemlists il ON t.listingId = il.Itemid 
                        INNER JOIN Users seller ON seller.id = il.user_id 
                        INNER JOIN Users buyer ON buyer.id = buyerId 
                        WHERE il.user_id = :currUser AND t.status NOT IN ('Archived', 'Paid')  
                        ORDER BY t.createdAt`, { type: sequelize.QueryTypes.SELECT, replacements: { currUser: req.user.id } }).then((Transactions) => {
            // formatting dates
            for (var i=0; i<Transactions.length; i++) {
                Transactions[i].createdAt = convertDate(Transactions[i].createdAt);
                Transactions[i].updatedAt = convertDate(Transactions[i].updatedAt);
            }
            res.render('allTransactions', {
                title: 'All Selling',
                uid: req.user.id,
                data: Transactions
            })
        }).catch((err) => {
            return res.status(400).send({
                message: err
            })
        })
    }
    else if (req.query.view == 'archived') {
        sequelize.query(`SELECT transactionId, listingId, seller.id sellerId, buyerId, t.createdAt, t.updatedAt, t.status, offer, ItemName, imageName, 
                        seller.username sellerUser, buyer.username buyerUser, paymentId, paymentMethod, buyerReady, sellerReady 
                        FROM Transactions t 
                        INNER JOIN itemlists il ON t.listingId = il.Itemid 
                        INNER JOIN Users seller ON seller.id = il.user_id 
                        INNER JOIN Users buyer ON buyer.id = buyerId 
                        WHERE (il.user_id = :currUser OR buyerId = :currUser) AND t.status IN ('Archived', 'Paid') 
                        ORDER BY t.createdAt`, { type: sequelize.QueryTypes.SELECT, replacements: { currUser: req.user.id } }).then((Transactions) => {
            // formatting dates
            for (var i=0; i<Transactions.length; i++) {
                Transactions[i].createdAt = convertDate(Transactions[i].createdAt);
                Transactions[i].updatedAt = convertDate(Transactions[i].updatedAt);
            }
            res.render('allTransactions', {
                title: 'Order History',
                uid: req.user.id,
                data: Transactions
            })
        }).catch((err) => {
            return res.status(400).send({
                message: err
            })
        })
    }
    else {
        sequelize.query(`SELECT transactionId, listingId, seller.id sellerId, buyerId, t.createdAt, t.updatedAt, t.status, offer, ItemName, imageName, 
                        seller.username sellerUser, buyer.username buyerUser, buyerReady, sellerReady 
                        FROM Transactions t 
                        INNER JOIN itemlists il ON t.listingId = il.Itemid 
                        INNER JOIN Users seller ON seller.id = il.user_id 
                        INNER JOIN Users buyer ON buyer.id = buyerId 
                        WHERE buyerId = :currUser AND t.status NOT IN ('Archived', 'Paid') 
                        ORDER BY t.createdAt`, { type: sequelize.QueryTypes.SELECT, replacements: { currUser: req.user.id } }).then((Transactions) => {
            // formatting dates
            for (var i=0; i<Transactions.length; i++) {
                Transactions[i].createdAt = convertDate(Transactions[i].createdAt);
                Transactions[i].updatedAt = convertDate(Transactions[i].updatedAt);
            }
            res.render('allTransactions', {
                title: 'All Buying',
                uid: req.user.id,
                data: Transactions
            })
        }).catch((err) => {
            return res.status(400).send({
                message: err
            })
        })
    }
}

/////////////////////////////////////////
//// List details of ONE transaction ////
/////////////////////////////////////////
exports.showDetails = function (req, res) {
    // Show transaction data
    var transactionId = req.params.transaction_id;
    sequelize.query(`SELECT transactionId, ItemName, u.username, status, qty, offer, paymentId, paymentMethod, bankDetails, t.createdAt, t.updatedAt  
    FROM Transactions t 
    INNER JOIN itemlists il ON il.Itemid = t.listingId 
    INNER JOIN Users u ON u.id = il.user_id  
    WHERE t.transactionId = :transaction_id `, { 
        replacements: {
            transaction_id: transactionId
        },
        type: sequelize.QueryTypes.SELECT
     }).then((Transactions) => {
        for (var i=0; i<Transactions.length; i++) {
            Transactions[i].createdAt = convertDate(Transactions[i].createdAt);
            Transactions[i].updatedAt = convertDate(Transactions[i].updatedAt);
        }
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

///////////////////////
//// Confirm Price ////
///////////////////////
exports.confirmPrice = function(req, res) {
    var tId = req.params.transaction_id;
    var uId = req.user.id;
    sequelize.query("SELECT buyerReady, sellerReady FROM Transactions WHERE transactionId = :transaction_id", { replacements: { transaction_id: tId }, model: Transaction }).then((results) => {
        var updateData = {}
        if (res.locals.isBuyer) {
            updateData.buyerReady = true;
        }
        else {
            updateData.sellerReady = true;
        }
        if ((results[0].buyerReady || updateData.buyerReady) && (results[0].sellerReady || updateData.sellerReady)) {
            updateData.status = 'Awaiting payment';
        }
        Transaction.update(updateData, { where: { transactionId: tId }, id: uId, action: 'CONFIRM_PR' }).then((updatedRecord) => {
            if (!updatedRecord || updatedRecord == 0) {
                return res.send(400, {
                    message: "error"
                });
            }
            res.redirect('/transactions');
        });
    })
}

//////////////////////
//// Change offer ////
//////////////////////
exports.changeOffer = function(req, res) {
    var tId = req.params.transaction_id;
    var uId = req.user.id;
    var updateData = {
        offer: req.body.newOffer,
    }
    console.log("\n\n\n\n\n\n\n\n\n\n\n\n" + res.locals.isBuyer)
    if (res.locals.isBuyer) {
        updateData.buyerReady = true;
        updateData.sellerReady = false;
    }
    else {
        updateData.buyerReady = false;
        updateData.sellerReady = true;
    }
    Transaction.update(updateData, { where: { transactionId: tId }, id: uId, action: 'NEW_OFFER' }).then((updatedRecord) => {
        if (!updatedRecord || updatedRecord == 0) {
            return res.send(400, {
                message: "error"
            });
        }
        res.redirect('/transactions');
    });
}

//////////////////////
//// Cancel Order ////
//////////////////////
exports.cancel = function (req, res) {
    var tId = req.params.transaction_id;
    var uId = req.user.id;
    var updateData = {
        status: 'Archived'
    }
    Transaction.update(updateData, { where: { transactionId: tId }, id: uId, action: 'CANCEL' }).then((updatedRecord) => {
        if (!updatedRecord || updatedRecord == 0) {
            return res.send(400, {
                message: "error"
            });
        }
        res.redirect('/transactions');
    });
}

/////////////////
//// Payment ////
/////////////////
exports.afterPayment = function (req, res) {
    var updateData = {
        status: 'Paid',
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