
// models/itemlist.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const itemlist = sequelize.define('itemlist', {
    Itemid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ItemName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
        trim: true
    },
    imageName: {
        type: Sequelize.STRING,
        allowNull: false

    },
    user_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    price: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false

    },
    visible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    Description: {
        type: Sequelize.STRING,
        allowNull: true
    },
    MeetupLocation: {
        type: Sequelize.STRING,
        allowNull: true 
    }, 
    pickupmethod: {
        type: Sequelize.STRING,
        allowNull: false
    }
});


// force: true will drop the table if it already exists
itemlist.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("item table synced");
});

module.exports = sequelize.model('itemlist', itemlist);