// models/test.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const Test = sequelize.define('Test', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
        trim: true
    }
}, {
    freezeTableName: true,
});

// force: true will drop the table if it already exists
Test.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("test table synced");

    Test.upsert({
        id:1,
        title: "narration"
    });
    Test.upsert({
        id:2,
        title: "acting"
    });
});

module.exports = sequelize.model('Test', Test);