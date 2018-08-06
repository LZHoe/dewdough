// models/servicesTransaction.js

//                                                         ______________
                                                          //// STATUS \\\\
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 1. Offering: Transaction is initiated by a user. Seller will also see pending transactions.                                     //
//    Can have new offer. Cannot make payment yet. Either user can completely close the transaction.                               //
// 2. Awaiting payment: Both users confirm the current offer, offer cannot be changed any longer. Allow the buyer to make payment. //
// 3. Paid: Buyer has made payment. Transaction is now read only. Seller should deliver item.                                      //
// 4. Archived: Transaction was closed in the Offering stage.                                                                      //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;
var serTransactionLog = require('../models/serTransactionLog');

const serTransaction = sequelize.define('ServicesTransaction', {
    transactionId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    offer: {
        type: Sequelize.DECIMAL(6,2),
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: "Offering",
        allowNull: false
    },
    listingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'servicelists',
            key: 'serviceid'
        }
    },
    buyerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    rating: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    comment: {
        type: Sequelize.STRING,
        allowNull: true
    },
    paymentId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    paymentMethod: {
        type: Sequelize.STRING,
        allowNull: true
    },
    bankDetails: {
        type: Sequelize.STRING,
        allowNull: true
    }, 
    buyerReady: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }, 
    sellerReady: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

// Enter entry into transaction log table right before any time ServicesTransaction table is updated
serTransaction.beforeBulkUpdate((updateData) => {
    // Retrieve the current(not yet updated) entry of the transaction
    var tId = updateData.where.transactionId;
    sequelize.query('SELECT * FROM ServicesTransactions WHERE transactionId = ' + tId, { model: serTransaction }).then((Transactions) => {
        var crrTransaction = Transactions[0];
        
        var newLog = {
            transactionId: crrTransaction.transactionId,
            qty: crrTransaction.qty,
            offer: crrTransaction.offer,
            status: crrTransaction.status,
            rating: crrTransaction.rating,
            comment: crrTransaction.comment,
            paymentId: crrTransaction.paymentId,
            paymentMethod: crrTransaction.paymentMethod,
            bankDetails: crrTransaction.bankDetails,
            action: updateData.action,
            commitBy: updateData.id,
            createdAt: crrTransaction.updatedAt,
            buyerReady: crrTransaction.buyerReady, 
            sellerReady: crrTransaction.sellerReady
        }

        serTransactionLog.create(newLog).then((loggedData) => {
            console.log('New log created: ' + loggedData);
        })
        }).catch((err) => {
            console.log("ERROR: " + err);
        });
});

// force: true will drop the table if it already exists
serTransaction.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("Transaction table synced");

    // Transaction.upsert({
    //     transactionId:1,
    //     qty:2,
    //     offer:25.50,
    //     status: 'Pending',
    //     listingId: 1,
    //     buyerId: 1,
    //     paymentId: null,
    //     paymentMethod: null
    // });
    // Transaction.upsert({
    //     transactionId:2,
    //     qty:2,
    //     offer:255,
    //     status: 'Delivering',
    //     listingId: 4,
    //     buyerId: 6,
    //     rating: 5,
    //     paymentId: 'h32r2hho9',
    //     paymentMethod: 'Paypal',
    //     bankDetails: 'something i guess?'
    // });
    // Transaction.upsert({
    //     transactionId:3,
    //     qty:3,
    //     offer:255,
    //     status: 'Complete',
    //     listingId: 4,
    //     buyerId: 3,
    //     paymentId: '7i3jyeqhq',
    //     paymentMethod: 'Paypal',
    //     bankDetails: 'something i guess!'
    // });
});

module.exports = sequelize.model('ServicesTransaction', serTransaction);