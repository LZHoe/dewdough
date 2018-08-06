// models/transactionLog.js

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
    // pendingOffer: {
    //     type: Sequelize.DECIMAL,
    //     allowNull: true
    // },
    // pendingOfferBy: {
    //     type: Sequelize.INTEGER,
    //     allowNull: true,
    //     references: {
    //         model: 'Users',
    //         key: 'id'
    //     }
    // },
    status: {
        type: Sequelize.STRING,
        defaultValue: "Offering",
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
        allowNull: false,
        defaultValue: 'UPDATED'
    },
    commitBy: {
        type: Sequelize.INTEGER,
        allowNull: false
    }, 
    buyerReady: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }, 
    sellerReady: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

// force: true will drop the table if it already exists
TransactionLog.sync({ force: false, logging: console.log}).then(() => {
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