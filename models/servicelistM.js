
// models/images.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const servicelist = sequelize.define('servicelist', {
    serviceid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    
    servicetitle: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
        trim: true
    },
    imageName: {
        type: Sequelize.STRING
    },
    user_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //     model: 'Users',
        //     key: 'id'
        // }
    },
    serviceprice: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
    },
    servicecategory: {
        type: Sequelize.STRING
    },
    visible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    servicedescription: {
        type: Sequelize.STRING,
        allowNull: true
    },
    location: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Yio Chu Kang MRT"
    }
});


// force: true will drop the table if it already exists
servicelist.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("service table synced");
});

module.exports = sequelize.model('servicelist', servicelist);