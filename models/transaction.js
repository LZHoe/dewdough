// models/transaction.js


var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;
var TransactionLog = require('../models/transactionLog');

const Transaction = sequelize.define('Transaction', {
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
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: "Pending",
        allowNull: false
    },
    listingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //     model: 'Listings',
        //     id: 'listingId'
        // }
    },
    buyerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            id: 'id'
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
    }
});

// Enter entry into transaction log table right before any time Transaction table is updated
Transaction.beforeBulkUpdate((updateData) => {
    // console.log("//////////////////////////YOU'RE★IN★THE★ZONE//////////////////////////");
    // console.log("data: " + JSON.stringify(updateData));
    // console.log("tId: " + updateData.where.transactionId);

    // Retrieve the current(not yet updated) entry of the transaction
    var tId = updateData.where.transactionId;
    sequelize.query('SELECT * FROM Transactions WHERE transactionId = ' + tId, { model: Transaction }).then((Transactions) => {
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
            action: "UPDATED",
            createdAt: crrTransaction.updatedAt
        }

        TransactionLog.create(newLog).then((loggedData) => {
            console.log('New log created: ' + loggedData);
        })
        }).catch((err) => {
            console.log("ERROR: " + err);
        });
});

// force: true will drop the table if it already exists
Transaction.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("Transaction table synced");

    Transaction.upsert({
        transactionId:1,
        qty:2,
        offer:25.50,
        status: 'Pending',
        listingId: 1,
        buyerId: 1
    });
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

module.exports = sequelize.model('Transaction', Transaction);