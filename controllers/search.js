var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var moment = require('moment');

// function to convert date from sql to more readable format using moment js
function convertDate (myDate) {
    var dateObj = moment(myDate);
    var newDate = moment(dateObj).calendar();
    return newDate;
}
exports.search = function (req, res) {
    var search = req.query.search;

    var sortBy = req.body.sortBy;
    if (search == "") search = "%";
   

    sequelize.query(
        `SELECT TOP (10) il.*,  sl.*, u.* from itemlists il
        INNER JOIN servicelists sl ON sl.user_id = il.user_id
        INNER JOIN Users u ON il.user_id = u.id  
        WHERE ( il.ItemName LIKE :search || sl.servicetitle LIKE :search) 
        ORDER BY il.createdAt || ORDER BY sl.createdAt;`, {
            replacements: {
                search: '%' + search + '%',
                
            },
            type: sequelize.QueryTypes.SELECT
        }).then((search) => {
            var reply = {}
            for (var i = 0; i < itemlist.length || i < servicelist.length || i < user.length; i++) {
                itemlist[i].createdAt = convertDate(itemlist[i].createdAt);
                itemlist[i].updatedAt = convertDate(itemlist[i].updatedAt);
                service[i].createdAt = convertDate(servicelist[i].createdAt);
                service[i].updatedAt = convertDate(servicelist[i].updatedAt);
        
            }
         
            reply = itemlist || servicelist || user;
            res.send(reply);
        }).catch((err) => {
            return res.status(400).send({
                message: err
            })
        })
}

// exports.searchfunction = function (req, res) {
//     var search = req.params.search;
//     var searchconfirm = search.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
//     var currentuser = req.user.id
//     console.log(search)
//     sequelize.query("select *, u.email AS [user_id] from productlists i join Users u on i.user_id = u.id WHERE i.ItemName like '%" +searchconfirm+"%' and i.user_id <> '"+ currentuser+"'"
//     , { model: productlist}).then((productlists)=> {

//         res.render('products-gallery', {
//             title: 'Product For Sale',
//             productlists: productlists,
//             user: req.user,
//             urlPath: req.protocol + "://" + req.get("host") + req.url
//         });

//     }).catch((err) => {
//         return res.status(400).send({
//             message: err
//         });
//     });
// };