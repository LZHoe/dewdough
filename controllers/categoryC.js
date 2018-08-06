var itemlists = require('../models/itemlist');
var servicelists = require('../models/servicelistM')
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;


exports.show = function (req, res) {
    sequelize.query('select il.*, sl.* from itemlists il \
    inner join servicelists sl on il.user_id = sl.user_id \
    inner join users u on il.user_id = u.id'
    , { model: itemlists }).then((listOverview) => {

            res.render('listingOverview', {
                title: 'CUTE ITEMS HEHE',
                list: listingoverview,

            });

        }).catch((err) => {
            return res.status(400).send({
                message: err
            });
            console.log(err)
        });
};

exports.showCat = function (req, res) {
    // Show item details
    var Itemid = req.params.Itemid;
    var itemcat = req.params.category;
    var servicecat = req.params.servicecategory
    sequelize.query('select il.*, sl.* from itemlists il \
    inner join servicelists sl on il.user_id = sl.user_id \
    inner join users u on il.user_id = u.id  \
    where il.category =' + itemcat + 'OR sl.servicecategory =' +servicecat, 
    { type: sequelize.QueryTypes.SELECT }).then((category) => {
            res.render('listingOverview', {
                title: 'List all',
                data: category
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