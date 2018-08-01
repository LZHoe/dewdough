// models/transaction.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const chat = sequelize.define('chat', {
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
chat.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("new card table synced");

});

module.exports = sequelize.model('chat', chat);