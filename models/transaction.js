// models/transaction.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

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
        defaultValue: "Prepurchase",
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
        // references: {
        //     model: 'User',
        //     id: 'userId'
        // }
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

// force: true will drop the table if it already exists
Transaction.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("Transaction table synced");

});

module.exports = sequelize.model('Transaction', Transaction);