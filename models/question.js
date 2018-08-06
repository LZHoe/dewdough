var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;



var Question = sequelize.define('Question', {
    questionId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name:{
        type: Sequelize.STRING,
        defaultValue:'',
    },
    email:{
        type: Sequelize.STRING,
        defaultValue : '',
    },
    question:{
        type: Sequelize.STRING,
        defaultValue:'',
    },
   

}, {
    freezeTableName: true,
});

// force: true will drop the table if it already exists
Question.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("test table synced");


});

module.exports = sequelize.model('Question', Question);