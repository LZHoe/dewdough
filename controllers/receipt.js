var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var Transaction = require('../models/transaction');
var itemlist = require('../models/itemlist');
var Users = require('../models/users');

exports.show = function (req,res){
    var transactionId = req.params.transaction_id;   
    sequelize.query(`SELECT transactionId, listingId, seller.id sellerId, buyerId, t.createdAt, t.updatedAt, 
    t.status, offer, il.ItemName, imageName,seller.username sellerUser, buyer.username buyerUser, buyerReady, sellerReady, 
    paymentMethod, paymentId 
    FROM Transactions t 
    INNER JOIN itemlists il ON t.listingId = il.Itemid 
    INNER JOIN Users seller ON seller.id = il.user_id 
    INNER JOIN Users buyer ON buyer.id = buyerId 
    WHERE t.transactionId = ` + transactionId, { type: sequelize.QueryTypes.SELECT }).then((Transactions) => {
        console.log(Transactions[0]);
        res.render('receipt', {
            title:'Online Receipt',
            data:Transactions[0],
        });

    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
        console.log(err)
    });
}

       

