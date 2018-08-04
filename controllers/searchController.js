var itemlists = require('../models/itemlist');
var servicelists = require('../models/servicelistM')
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;


exports.show = function (req, res) {
    var userID = req.user.id;
    sequelize.query('select * from itemlists'
    , { model: itemlists }).then((listOverview) => {

            res.render('listingOverview', {
                title: 'CUTE ITEMS HEHE',
                listingOverview: listingoverview,

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
    var Category = req.params.category;
    sequelize.query(`select * from itemlists WHERE category = :category`,
        { type: sequelize.QueryTypes.SELECT, replacements: { category: Category } }).then((listingOverview) => {
            res.render('listingOverview', {
                title: 'Listing Overview',
                listOverview: listOverview
            })
        }).catch((err) => {
            return res.status(400).send({
                message: err
            })
        })
    }