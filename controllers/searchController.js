var itemlists = require('../models/itemlist');
var servicelists = require('../models/servicelistM')
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;


exports.show = function (req, res) {
    var userID = req.user.id;
    sequelize.query('select itemid, u.username, u.id ItemName, imageName, \
    category, price, Description, pickupmethod, visible, MeetupLocation, createdAt, updatedAt \
     from itemlists t inner join users u on t.user_id = u.id where user_id = '
     + userID, { model: itemlist}).then((itemlist)=> {

        res.render('itemlist', {
            title: 'CUTE ITEMS HEHE',
            itemlist: itemlist,
            
        });

    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
        console.log(err)
    });
};

exports.showDetails = function (req, res) {
    // Show item details
    var Itemid = req.params.Itemid;
    sequelize.query('select itemid, u.username, ItemName, imageName, category, \
    price, Description, pickupmethod, visible, MeetupLocation, createdAt, updatedAt \
    from itemlists t inner join users u on t.user_id = u.id WHERE Itemid = ' 
    + Itemid, { type: sequelize.QueryTypes.SELECT }).then((itempage) => {
        res.render('itemPage', {
            title: 'Item Details',
            itemlist: itempage[0]
        })
    }).catch((err) => {
        return res.status(400).send({
            message: err
        })
    })
}

exports.Itemcategory = function (req, res) {
    // Show item details
    var Category = req.body.category
    sequelize.query(`select * from itemlists WHERE category = ' + Category)

    + Itemid, { type: sequelize.QueryTypes.SELECT }).then((itempage) => {
        res.render('itemPage', {
            title: 'Item Details',
            itemlist: itempage[0]
        })
    }).catch((err) => {
        return res.status(400).send({
            message: err
        })
    })
