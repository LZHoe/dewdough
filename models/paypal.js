// models/paypal.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;



const PAYPAL = sequelize.define('PAYPAL', {
    paymentID: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    transactionNo: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
        trim: true
    },
    buyerID: {
        type: Sequelize.INTEGER,
        allowNull:false,
        defaultValue: '',
        trim:true
    },
    sellerID:{
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue: '',
        trim:true
    },
    totalamount:{
        type:Sequelize.FLOAT,
        allowNull:false,
        defaultValue: '',
        trim:true
    },

}, {
    freezeTableName: true,
});

// force: true will drop the table if it already exists
PAYPAL.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("test table synced");

    PAYPAL.upsert({
        paymentID:1,
        buyerID:2,
        sellerID:3,
        totalamount:4,
        transactionNo:5,
    });
});

module.exports = sequelize.model('PAYPAL', PAYPAL);