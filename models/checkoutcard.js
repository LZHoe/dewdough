// models/transaction.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const checkoutcard = sequelize.define('checkoutcard', {
    cardnumber: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    expiry: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 1
    },
    cardname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cardcode: {
        type: Sequelize.INTEGER,
        allowNull: false,
    }
    });

// force: true will drop the table if it already exists
checkoutcard.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("new card table synced");

});

module.exports = sequelize.model('checkoutcard', checkoutcard);