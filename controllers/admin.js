var Transaction = require('../models/transaction');
var TransactionLog = require('../models/transactionLog');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var itemlists = require('../models/itemlist');
var moment = require('moment');
var User = require('../models/users')

// function to convert date from sql to more readable format
// requires moment js!!!
function convertDate(myDate) {
    var dateObj = moment(myDate);
    var newDate = moment(dateObj).calendar();
    return newDate;
}

exports.show = function (req, res) {
    res.render('admin', {
        title: 'Admin Page'
    })
}

exports.showServices = function (req, res) {
    res.render('adminServices', {
        title: 'Admin Page'
    })
}

exports.search = function (req, res) {
    var byListing = req.body.byListing;
    var byUser = req.body.byUser;
    var byTransNo = req.body.byTransNo;
    if (byListing == "") byListing = "%";
    if (byUser == "") byUser = "%";
    if (byTransNo == "") byTransNo = "%";

    sequelize.query(
        `SELECT transactionId, listingId, t.createdAt, t.updatedAt, offer, buyer.username buyerUser, seller.username sellerUser, ItemName, status 
        FROM Transactions t 
        INNER JOIN itemlists il ON t.listingId = il.Itemid 
        INNER JOIN Users buyer ON buyer.id = t.buyerId 
        INNER JOIN Users seller ON seller.id = il.user_id 
        WHERE buyer.username LIKE :inputBuyer  
        AND transactionId LIKE :inputTransId 
        AND ItemName LIKE :inputList 
        ORDER BY t.createdAt;`, {
            replacements: {
                inputBuyer: '%' + byUser + '%',
                inputTransId: byTransNo,
                inputList: '%' + byListing + '%'
            },
            type: sequelize.QueryTypes.SELECT
        }).then((Transactions) => {
            var reply = {}
            for (var i = 0; i < Transactions.length; i++) {
                Transactions[i].createdAt = convertDate(Transactions[i].createdAt);
                Transactions[i].updatedAt = convertDate(Transactions[i].updatedAt);
            }
            reply = Transactions;
            res.send(reply);
        }).catch((err) => {
            return res.status(400).send({
                message: err
            })
        })
}

exports.searchServices = function (req, res) {
    var byListing = req.body.byListing;
    var byUser = req.body.byUser;
    var byTransNo = req.body.byTransNo;
    if (byListing == "") byListing = "%";
    if (byUser == "") byUser = "%";
    if (byTransNo == "") byTransNo = "%";

    sequelize.query(
        `SELECT transactionId, listingId, t.createdAt, t.updatedAt, offer, buyer.username buyerUser, seller.username sellerUser, servicetitle, status 
        FROM ServicesTransactions t 
        INNER JOIN servicelists sl ON t.listingId = sl.serviceid 
        INNER JOIN Users buyer ON buyer.id = t.buyerId 
        INNER JOIN Users seller ON seller.id = sl.user_id 
        WHERE buyer.username LIKE :inputBuyer  
        AND transactionId LIKE :inputTransId 
        AND servicetitle LIKE :inputList 
        ORDER BY t.createdAt;`, {
            replacements: {
                inputBuyer: '%' + byUser + '%',
                inputTransId: byTransNo,
                inputList: '%' + byListing + '%'
            },
            type: sequelize.QueryTypes.SELECT
        }).then((Transactions) => {
            var reply = {}
            for (var i = 0; i < Transactions.length; i++) {
                Transactions[i].createdAt = convertDate(Transactions[i].createdAt);
                Transactions[i].updatedAt = convertDate(Transactions[i].updatedAt);
            }
            reply = Transactions;
            res.send(reply);
        }).catch((err) => {
            return res.status(400).send({
                message: err
            })
        })
}

exports.showMessages = function(req, res) {
    sequelize.query(
        `SELECT * FROM Question`, 
        { type: sequelize.QueryTypes.SELECT }
    ).then((messages) => {
        for (var i = 0; i < messages.length; i++) {
            messages[i].createdAt = convertDate(messages[i].createdAt);
            messages[i].updatedAt = convertDate(messages[i].updatedAt);
        }
        res.render('adminMessages', {
            title: 'Admin Support',
            messages: messages
        })
    })
}

exports.showUsers = function(req, res) {
    sequelize.query(
        `SELECT * FROM Users`, 
        { type: sequelize.QueryTypes.SELECT }
    ).then((messages) => {
       
        res.render('adminusers', {
            title: 'Admin Support',
            user: messages
        })
    })
}

exports.delete = function(req,res){
    var transaction_id = req.params.transaction_id;
    sequelize.query(`SELECT il.visible, il.Itemid
                    FROM Transactions t 
                    INNER JOIN itemlists il 
                    ON t.listingId = il.Itemid 
                    WHERE t.transactionId = ` + transaction_id,{ type: sequelize.QueryTypes.SELECT}).then((instance)=>{

                        itemid = instance[0].Itemid;

                        var private = {
                            visible : false
                        }

                        itemlists.update(private, { where: { Itemid : itemid }, id: req.user.id, action: 'PAID' }).then((updatedRecord) => {
                            if (!updatedRecord || updatedRecord == 0) {
                                return res.send(400, {
                                    message: "error"
                                });
                            }
                            res.redirect('/transactions/' + transaction_id);
                        });
                    
    })
}

exports.showeditform = function(req,res){
    var transaction_id = req.params.transaction_id;
    sequelize.query(`SELECT *
                    FROM Transactions t 
                    INNER JOIN itemlists il 
                    ON t.listingId = il.Itemid 
                    WHERE t.transactionId = ` + transaction_id,{ type: sequelize.QueryTypes.SELECT}).then((instance)=>{
                        console.log("aheas");
                        console.log(instance[0]);
                        res.render('adminedit',{
                            item : instance[0]
                        })

                    })
                
}

exports.edit = function(req,res){
    var transaction_id = req.params.transaction_id;
    sequelize.query(`SELECT *
                    FROM Transactions t 
                    INNER JOIN itemlists il 
                    ON t.listingId = il.Itemid 
                    WHERE t.transactionId = ` + transaction_id,{ type: sequelize.QueryTypes.SELECT}).then((instance)=>{
                        console.log(instance[0])

                        
                        console.log("MOTHER DIE")
  
                        
                        var updateItem = {
                            ItemName: req.body.ItemName,
                            price: req.body.price,
                            category: req.body.category,
                            Description: req.body.Description,
                            MeetupLocation: req.body.MeetupLocation,

                        }

                        console.log(updateItem)
                        itemid = instance[0].Itemid;


                        itemlists.update(updateItem, { where: { Itemid : itemid }, id: req.user.id, action: 'PAID' }).then((updatedRecord) => {
                            if (!updatedRecord || updatedRecord == 0) {
                                return res.send(400, {
                                    message: "error"
                                });
                            }
                            res.redirect('/transactions/' + transaction_id);
                        });

                        

                    })
                }

exports.showdetails = function(req,res){
    var id = req.body.inputlistingid;
    res.redirect('/transactions/'+id)
}


exports.showeditforms = function(req,res){
    var transaction_id = req.params.transaction_id;
    sequelize.query(`SELECT *
                    FROM ServicesTransactions t 
                    INNER JOIN servicelists il 
                    ON t.listingId = il.serviceid
                    WHERE t.transactionId = ` + transaction_id,{ type: sequelize.QueryTypes.SELECT}).then((instance)=>{
                        console.log("aheas");
                        console.log(instance[0]);
                        res.render('adminedits',{
                            item : instance[0]
                        })

                    })
                
}

exports.edits = function(req,res){
    var transaction_id = req.params.transaction_id;
    sequelize.query(`SELECT *
                    FROM ServicesTransactions t 
                    INNER JOIN servicelists il 
                    ON t.listingId = il.serviceid 
                    WHERE t.transactionId = ` + transaction_id,{ type: sequelize.QueryTypes.SELECT}).then((instance)=>{
                        console.log(instance[0])

                        
                        console.log("MOTHER DIE")
  
                        
                        var updateItem = {
                            servicetitle: req.body.servicetitle,
                            serviceprice: req.body.serviceprice,
                            servicecategory: req.body.servicecategory,
                            servicedescription: req.body.serivcedescription,
                        }

                        console.log(updateItem)
                        itemid = instance[0].Itemid;


                        servicelists.update(updateItem, { where: { Itemid : itemid }, id: req.user.id, action: 'PAID' }).then((updatedRecord) => {
                            if (!updatedRecord || updatedRecord == 0) {
                                return res.send(400, {
                                    message: "error"
                                });
                            }
                            res.redirect('/transactionss/' + transaction_id);
                        });

                        

                    })
                }



exports.undelete = function(req,res){
    var transaction_id = req.params.transaction_id;
    sequelize.query(`SELECT il.visible, il.Itemid
                    FROM Transactions t 
                    INNER JOIN itemlists il 
                    ON t.listingId = il.serviceid 
                    WHERE t.transactionId = ` + transaction_id,{ type: sequelize.QueryTypes.SELECT}).then((instance)=>{

                        itemid = instance[0].Itemid;

                        var private = {
                            visible : true
                        }

                        itemlists.update(private, { where: { Itemid : itemid }, id: req.user.id, action: 'PAID' }).then((updatedRecord) => {
                            if (!updatedRecord || updatedRecord == 0) {
                                return res.send(400, {
                                    message: "error"
                                });
                            }
                            res.redirect('/transactions/' + transaction_id);
                        });
                    
    })
}



exports.modifyuser=function(req,res){
    var user_id = req.params.id;
    sequelize.query(`select * from Users where id= `+user_id,{type:sequelize.QueryTypes.SELECT}).then((instance)=>{
        user = instance[0];
        res.render("adminmodifyuser",{
            user : instance[0]
        }
    )

}
       

    )}

exports.modifyinguser=function(req,res){
    var userid = req.params.id;
    var userdata= {
        name :req.body.name,
        username :req.body.username,
        email : req.body.email,
        phone:req.body.phone,
    }

    User.update(userdata, { where: {id:userid }, id: req.user.id, action: 'PAID' }).then((updatedRecord) => {
        if (!updatedRecord || updatedRecord == 0) {
            return res.send(400, {
                message: "error"
            });
        }
        res.redirect('/admin/users');
    });}