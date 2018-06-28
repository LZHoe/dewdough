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
Transaction.sync({ force: true, logging: console.log}).then(() => {
    // Table created
    console.log("Transaction table synced");

    Transaction.upsert({
        transactionId:1,
        qty:2,
        offer:25.50,
        status: 'Prepurchase',
        listingId: 1,
        buyerId: 2
    });
    Transaction.upsert({
        transactionId:2,
        qty:2,
        offer:255,
        status: 'Delivering',
        listingId: 4,
        buyerId: 6,
        rating: 5,
        paymentId: 'h32r2hho9',
        paymentMethod: 'Paypal',
        bankDetails: 'something i guess?'
    });
    Transaction.upsert({
        transactionId:3,
        qty:3,
        offer:255,
        status: 'Complete',
        listingId: 4,
        buyerId: 3,
        paymentId: '7i3jyeqhq',
        paymentMethod: 'Paypal',
        bankDetails: 'something i guess!'
    });
});

module.exports = sequelize.model('Transaction', Transaction);