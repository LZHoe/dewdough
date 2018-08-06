var Transaction = require('../models/transaction');
var serTransaction = require('../models/servicesTransaction');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var itemlists = require('../models/itemlist');
var servicelists = require('../models/servicelistM');
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
            res.locals.isBuyer = true;
        } 
        else {
            res.locals.isBuyer = false;
        }
        return next();
    })
}

// function given user id and transaction id, if user is buyer
exports.isBuyerServices = function (req, res, next) {
    var tId = req.params.transaction_id;
    var uId = req.user.id;
    sequelize.query('SELECT buyerId FROM ServicesTransactions WHERE transactionId = :tId', { model: serTransaction, replacements: { tId: tId } }).then((Transactions) => {
        if (Transactions[0].buyerId == uId) {
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

////////////////////////////////////////
//// List all SERVICES transactions ////
////////////////////////////////////////
exports.showAllServices = function (req, res) {
    // Join transactions & item listing table
    if (req.query.view == 'listed') {
        sequelize.query(`SELECT transactionId, listingId, seller.id sellerId, buyerId, t.createdAt, t.updatedAt, t.status, offer, servicetitle, imageName, 
                        seller.username sellerUser, buyer.username buyerUser, buyerReady, sellerReady 
                        FROM ServicesTransactions t 
                        INNER JOIN servicelists sl ON t.listingId = sl.serviceid 
                        INNER JOIN Users seller ON seller.id = sl.user_id 
                        INNER JOIN Users buyer ON buyer.id = buyerId 
                        WHERE sl.user_id = :currUser AND t.status NOT IN ('Archived', 'Paid')  
                        ORDER BY t.createdAt`, { type: sequelize.QueryTypes.SELECT, replacements: { currUser: req.user.id } }).then((Transactions) => {
            // formatting dates
            for (var i=0; i<Transactions.length; i++) {
                Transactions[i].createdAt = convertDate(Transactions[i].createdAt);
                Transactions[i].updatedAt = convertDate(Transactions[i].updatedAt);
            }
            res.render('allSerTransactions', {
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
        sequelize.query(`SELECT transactionId, listingId, seller.id sellerId, buyerId, t.createdAt, t.updatedAt, t.status, offer, servicetitle, imageName, 
                        seller.username sellerUser, buyer.username buyerUser, paymentId, paymentMethod, buyerReady, sellerReady 
                        FROM ServicesTransactions t 
                        INNER JOIN servicelists sl ON t.listingId = sl.serviceid 
                        INNER JOIN Users seller ON seller.id = sl.user_id 
                        INNER JOIN Users buyer ON buyer.id = buyerId 
                        WHERE (sl.user_id = :currUser OR buyerId = :currUser) AND t.status IN ('Archived', 'Paid') 
                        ORDER BY t.createdAt`, { type: sequelize.QueryTypes.SELECT, replacements: { currUser: req.user.id } }).then((Transactions) => {
            // formatting dates
            for (var i=0; i<Transactions.length; i++) {
                Transactions[i].createdAt = convertDate(Transactions[i].createdAt);
                Transactions[i].updatedAt = convertDate(Transactions[i].updatedAt);
            }
            res.render('allSerTransactions', {
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
        sequelize.query(`SELECT transactionId, listingId, seller.id sellerId, buyerId, t.createdAt, t.updatedAt, t.status, offer, servicetitle, imageName, 
                        seller.username sellerUser, buyer.username buyerUser, buyerReady, sellerReady 
                        FROM ServicesTransactions t 
                        INNER JOIN servicelists sl ON t.listingId = sl.serviceid 
                        INNER JOIN Users seller ON seller.id = sl.user_id 
                        INNER JOIN Users buyer ON buyer.id = buyerId 
                        WHERE buyerId = :currUser AND t.status NOT IN ('Archived', 'Paid') 
                        ORDER BY t.createdAt`, { type: sequelize.QueryTypes.SELECT, replacements: { currUser: req.user.id } }).then((Transactions) => {
            // formatting dates
            for (var i=0; i<Transactions.length; i++) {
                Transactions[i].createdAt = convertDate(Transactions[i].createdAt);
                Transactions[i].updatedAt = convertDate(Transactions[i].updatedAt);
            }
            res.render('allSerTransactions', {
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
    sequelize.query(`SELECT * 
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
        sequelize.query(`SELECT *
        FROM TransactionLogs tl 
        INNER JOIN Users u ON u.id = tl.commitBy 
        WHERE transactionId = :transaction_id `, {
            replacements: {
                transaction_id: transactionId
            },
            type: sequelize.QueryTypes.SELECT
        }).then((TransactionLogs) => {
            console.log("Slut")
            console.log(Transactions[0])
            // formatting dates
            for (var i=0; i<TransactionLogs.length; i++) {
                TransactionLogs[i].updatedAt = convertDate(TransactionLogs[i].updatedAt);
            }
            res.render('transactionsDetails', {
                title: 'Transaction Details',
                data: Transactions[0],
                logData: TransactionLogs,

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
// exports.OLDcreate = function (req, res) {
//     var initialPrice = 0;
//     sequelize.query("SELECT price FROM itemlists WHERE Itemid = :listingid", { replacements: { listingid: req.body.listingId }, model: itemlists }).then((results) => {

//         // retreive user input
//         var transactionData = {
//             qty: req.body.qty,
//             listingId: req.body.listingId,
//             buyerId: req.user.id,
//             offer: results[0].price
//         };

//         // after retreiving, push into db
//         Transaction.create(transactionData).then((newTransaction, created) => {
//             if (!newTransaction) {
//                 return res.send(400, {
//                     message: "error"
//                 });
//             }

//             console.log("New transaction successful");
//             res.redirect('/transactions');
//         });
//     }).catch((err) => {
//         return res.status(400).send({
//             message: err
//         })
//     })
// }

/////////////////////////////////////////////////////
//// Check that there is no existing transaction ////
/////////////////////////////////////////////////////
exports.validateUnique = function (req, res, next) {
    var listId = req.params.listing_id;
    sequelize.query("SELECT transactionId FROM Transactions WHERE listingId = :listingid AND buyerId = :currUser AND status NOT IN ('Archived', 'Paid')", 
    { replacements: { 
        listingid: listId,
        currUser: req.user.id
    }, 
    model: Transaction 
    }).then((results) => {
        if (results.length == 0) {
            return next();
        }
        res.redirect('/transactions#transaction_' + results[0].transactionId);
    })
}

//////////////////////////////////////////////////////////////
//// Check that there is no existing transaction(SERVICE) ////
//////////////////////////////////////////////////////////////
exports.validateUniqueService = function (req, res, next) {
    var listId = req.params.listing_id;
    sequelize.query("SELECT transactionId FROM ServicesTransactions WHERE listingId = :listingid AND buyerId = :currUser AND status NOT IN ('Archived', 'Paid')", 
    { replacements: { 
        listingid: listId,
        currUser: req.user.id
    }, 
    model: serTransaction 
    }).then((results) => {
        if (results.length == 0) {
            return next();
        }
        res.redirect('/servicestransactions#transaction_' + results[0].transactionId);
    })
}

////////////////////////////////////////////////
//// Start a transaction with initial offer ////
////////////////////////////////////////////////
exports.create = function (req, res) {
    var listId = req.params.listing_id;
    sequelize.query("SELECT price FROM itemlists WHERE Itemid = :listingid", { replacements: { listingid: listId }, model: itemlists }).then((results) => {

        // retreive user input
        var transactionData = {
            qty: 1,
            listingId: listId,
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

////////////////////////////////////////////////
//// Start a transaction with initial offer ////
////////////////////////////////////////////////
exports.createForService = function (req, res) {
    var listId = req.params.listing_id;
    sequelize.query("SELECT serviceprice FROM servicelists WHERE serviceid = :listingid", { replacements: { listingid: listId }, model: servicelists }).then((results) => {

        // retreive user input
        var transactionData = {
            listingId: listId,
            buyerId: req.user.id,
            offer: results[0].serviceprice
        };

        // after retreiving, push into db
        serTransaction.create(transactionData).then((newTransaction, created) => {
            if (!newTransaction) {
                return res.send(400, {
                    message: "error"
                });
            }

            console.log("New transaction successful");
            res.redirect('/servicestransactions');
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
            if (res.locals.isBuyer) {
                res.redirect('/transactions');
            }
            else {
                res.redirect('/transactions?view=selling');
            }
        });
    })
}

/////////////////////////////////
//// Confirm Price(SERVICES) ////
/////////////////////////////////
exports.confirmPriceServices = function(req, res) {
    var tId = req.params.transaction_id;
    var uId = req.user.id;
    sequelize.query("SELECT buyerReady, sellerReady FROM ServicesTransactions WHERE transactionId = :transaction_id", { replacements: { transaction_id: tId }, model: serTransaction }).then((results) => {
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
        serTransaction.update(updateData, { where: { transactionId: tId }, id: uId, action: 'CONFIRM_PR' }).then((updatedRecord) => {
            if (!updatedRecord || updatedRecord == 0) {
                return res.send(400, {
                    message: "error"
                });
            }
            if (res.locals.isBuyer) {
                res.redirect('/servicestransactions');
            }
            else {
                res.redirect('/servicestransactions?view=listed');
            }
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
        if (res.locals.isBuyer) {
            res.redirect('/transactions');
        }
        else {
            res.redirect('/transactions?view=selling');
        }
    });
}

////////////////////////////////
//// Change offer(SERVICES) ////
////////////////////////////////
exports.changeOffer = function(req, res) {
    var tId = req.params.transaction_id;
    var uId = req.user.id;
    var updateData = {
        offer: req.body.newOffer,
    }
    if (res.locals.isBuyer) {
        updateData.buyerReady = true;
        updateData.sellerReady = false;
    }
    else {
        updateData.buyerReady = false;
        updateData.sellerReady = true;
    }
    serTransaction.update(updateData, { where: { transactionId: tId }, id: uId, action: 'NEW_OFFER' }).then((updatedRecord) => {
        if (!updatedRecord || updatedRecord == 0) {
            return res.send(400, {
                message: "error"
            });
        }
        if (res.locals.isBuyer) {
            res.redirect('/servicestransactions');
        }
        else {
            res.redirect('/servicestransactions?view=listed');
        }
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

////////////////////////////////
//// Cancel Order(SERVICES) ////
////////////////////////////////
exports.cancelService = function (req, res) {
    var tId = req.params.transaction_id;
    var uId = req.user.id;
    var updateData = {
        status: 'Archived'
    }
    serTransaction.update(updateData, { where: { transactionId: tId }, id: uId, action: 'CANCEL' }).then((updatedRecord) => {
        if (!updatedRecord || updatedRecord == 0) {
            return res.send(400, {
                message: "error"
            });
        }
        res.redirect('/servicestransactions?view=archived');
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