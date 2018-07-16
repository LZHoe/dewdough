// models/transactionLog.js
////////////////////// WIP /////////////////////

var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;
// var Transaction = require('../models/transaction')

const TransactionLog = sequelize.define('TransactionLog', {
    logId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
        },
    transactionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: "Transactions",
            key: "transactionId"
        }
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
    action: {
        type: Sequelize.STRING(10),
        allowNull: false
    },
    commitBy: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

// force: true will drop the table if it already exists
TransactionLog.sync({ force: true, logging: console.log}).then(() => {
    // Table created
    console.log("Transaction table synced");

    // TransactionLog.upsert({
    //     transactionId:1,
    //     qty:2,
    //     offer:25.50,
    //     status: 'Pending',
    //     listingId: 1,
    //     buyerId: 2
    // });
});

module.exports = sequelize.model('TransactionLog', TransactionLog);