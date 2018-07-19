// models/users.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const Users = sequelize.define('Users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING
    },
    
    phone: {
        type: Sequelize.INTEGER
    },
    password: {
        type: Sequelize.STRING
    },

});

// force: true will drop the table if it already exists
Users.sync({force: false, logging:console.log}).then(()=>{
    console.log("users table synced");
    Users.upsert({
        id: 1,
        username: 'Ben',
        name: 'Ben',
        email: 'a@b.com',
        phone: 98777383,
        password: '1234'
    });
    Users.upsert({
        id: 101,
        username: 'admin',
        name: 'admin',
        email: 'admin@admin.com',
        phone: 00000000,
        password: 'admin'
    });
});

module.exports = sequelize.model('Users', Users);