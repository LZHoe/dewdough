// models/paypal.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;
var data = require("../controllers/paypal");



const PAYPAL = sequelize.define('PAYPAL', {
    paymentID: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    paymentmethod: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
        trim: true
    },
    paymentdetails: {
        type: Sequelize.STRING,
        allowNull:true,
        defaultValue: '',
        trim:true
    },
    totalamount:{
        type:Sequelize.FLOAT,
        allowNull:false,
        defaultValue: '',
        trim:true
    },
    // transactionID:{
    //     type:Sequelize.STRING,
    //     references: {
    //         model: 'Transactions',
    //         key: 'transactionId',
    //     }
    // }

}, {
    freezeTableName: true,
});

// force: true will drop the table if it already exists
PAYPAL.sync({ force: true, logging: console.log}).then(() => {
    // Table created
    console.log("test table synced");

    PAYPAL.upsert({
        paymentID:2,
        paymentmethod:"paypal",
        paymentdetails:"",
        totalamount:"321312",
    });
});

module.exports = sequelize.model('PAYPAL', PAYPAL);