// models/paypal.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;
var data = require("../controllers/paypal");



var PAYPAL = sequelize.define('PAYPAL', {
    ID: {
        type: Sequelize.STRING,
        primaryKey: true,
        defaultValue:'',
    },
    paymentmethod:{
        type: Sequelize.STRING,
        defaultValue:'',
    },
    bankdetail:{
        type: Sequelize.STRING,
        defaultValue : '',
    },
   

}, {
    freezeTableName: true,
});

// force: true will drop the table if it already exists
PAYPAL.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("test table synced");


});

module.exports = sequelize.model('PAYPAL', PAYPAL);