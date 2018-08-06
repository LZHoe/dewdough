// Import modules
var fs = require('fs');
var mime = require('mime');
var gravatar = require('gravatar');

// set image file types
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

var itemlist = require('../models/itemlist');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var moment = require('moment');

// function to convert date from sql to more readable format using moment js
function convertDate(myDate) {
    var dateObj = moment(myDate);
    var newDate = moment(dateObj).calendar();
    return newDate;
}

// Show images gallery -  function to get all the uploaded images from the database and show it on the page. 
exports.show = function (req, res) {

    sequelize.query('select il.*, u.username from itemlists il INNER JOIN Users u ON il.user_id = u.id \
    WHERE il.user_id = ' + req.user.id + ' AND il.visible = 1'
        , { type: sequelize.QueryTypes.SELECT }).then((itemlist) => {
            for (var i = 0; i < itemlist.length; i++) {
                itemlist[i].createdAt = convertDate(itemlist[i].createdAt);
                itemlist[i].updatedAt = convertDate(itemlist[i].updatedAt);
            }
            res.render('itemlist', {
                title: 'CUTE ITEMS HEHE',
                itemlist: itemlist,
                user: req.user.id
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
    sequelize.query('select il.*, u.username from itemlists il \
    INNER JOIN Users u ON il.user_id = u.id WHERE il.Itemid = ' + Itemid,
         { type: sequelize.QueryTypes.SELECT }).then((itempage) => {
            for (var i = 0; i < itemlist.length; i++) {
                itemlist[i].createdAt = convertDate(itemlist[i].createdAt);
                itemlist[i].updatedAt = convertDate(itemlist[i].updatedAt);
            }
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

exports.showCat = function (req, res) {
    // Show item details
    var Itemid = req.params.Itemid;
    sequelize.query('select il.*, u.username from itemlists il \
    INNER JOIN Users u ON il.user_id = u.id \
    WHERE il.category LIKE \'%Cat%\' ',
         { type: sequelize.QueryTypes.SELECT }).then((itempage) => {
            for (var i = 0; i < itemlist.length; i++) {
                itemlist[i].createdAt = convertDate(itemlist[i].createdAt);
                itemlist[i].updatedAt = convertDate(itemlist[i].updatedAt);
            }
            res.render('allItems', {
                title: 'Item Details',
                itemlist: itempage
            })
        }).catch((err) => {
            return res.status(400).send({
                message: err
            })
        })
}

exports.showDog = function (req, res) {
    // Show item details
    sequelize.query('select il.*, u.username from itemlists il \
    INNER JOIN Users u ON il.user_id = u.id \
    WHERE il.category LIKE  \'%Dog%\' ',
         { type: sequelize.QueryTypes.SELECT }).then((itempage) => {
            for (var i = 0; i < itemlist.length; i++) {
                itemlist[i].createdAt = convertDate(itemlist[i].createdAt);
                itemlist[i].updatedAt = convertDate(itemlist[i].updatedAt);
            }
            res.render('allItems', {
                title: 'Item Details',
                itemlist: itempage
            })
        }).catch((err) => {
            return res.status(400).send({
                message: err
            })
        })
}

exports.editItemRecord = function (req, res) {
    var Itemid = req.params.Itemid;
    itemlist.findById(Itemid).then(function (itemRecord) {
        res.render('editItem', {
            title: "Edit Item Listing",
            item: itemRecord,
            hostPath: req.protocol + "://" + req.get("host")
        });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        })
    })
}

exports.update = function (req, res) {
    var Itemid = req.params.Itemid;
    var src;
    var dest;
    var targetPath;
    var targetName;
    var tempPath = req.file.path;
    console.log(req.file);
    // get the mime type of the file
    var type = mime.lookup(req.file.mimetype);
    // get file extension
    var extension = req.file.path.split(/[. ]+/).pop();
    // check support file types
    if (IMAGE_TYPES.indexOf(type) == -1) {
        return res.status(415).send('Supported image formats: jpeg, jpg, jpe, png. ');
    }
    // Set new path to images
    targetPath = './public/img_uploads/' + req.file.originalname;
    // using read stream API to read file
    src = fs.createReadStream(tempPath);
    // using a write stream API to write file
    dest = fs.createWriteStream(targetPath);
    src.pipe(dest);
    // Show error
    src.on('error', function (err) {
        if (err) {
            return res.status(500).send({
                message: error
            });
        }
    });
    src.on('end', function () {
        var updateItem = {
            ItemName: req.body.ItemName,
            imageName: req.file.originalname,
            user_id: req.user.id,
            price: req.body.price,
            category: req.body.category,
            Description: req.body.Description,
            MeetupLocation: req.body.MeetupLocation,
            pickupmethod: req.body.pickupmethod
        }
        console.log("\n\n\n\n\n" + req.body.Description);
        itemlist.update(updateItem, { where: { Itemid: Itemid } }).then((updatedItem) => {
            if (!updatedItem || updatedItem == 0) {
                return res.send(400, {
                    message: "error"
                });
            }
            res.status(200).send({ message: "updated Item record: " + Itemid });
        });

        // remove from temp folder
        fs.unlink(tempPath, function (err) {
            if (err) {
                return res.status(500).send('Something bad happened here');
            }
            // Redirect to gallery's page
            res.redirect('/itemlisted');
        });
    });
 
};

exports.delete = function (req, res){
    var Itemid = req.params.Itemid;
        var updateItem = {
            visible: false 
        }
        itemlist.update(updateItem, { where: { Itemid: Itemid } }).then((updatedItem) => {
            if (!updateItem || updateItem == 0) {
                return res.send(400, {
                    message: "error"
                });

            }
            res.redirect("/itemlisted");
        });
}

// Image upload //
exports.uploadImage = function (req, res) {
    console.log("i am in here");
    var src;
    var dest;
    var targetPath;
    var targetName;
    var tempPath = req.file.path;
    console.log(req.file);
    // get the mime type of the file
    var type = mime.lookup(req.file.mimetype);
    // get file extension
    var extension = req.file.path.split(/[. ]+/).pop();
    // check support file types
    if (IMAGE_TYPES.indexOf(type) == -1) {
        return res.status(415).send('Supported image formats: jpeg, jpg, jpe, png. ');
    }
    // Set new path to images
    targetPath = './public/img_uploads/' + req.file.originalname;
    // using read stream API to read file
    src = fs.createReadStream(tempPath);
    // using a write stream API to write file
    dest = fs.createWriteStream(targetPath);
    src.pipe(dest);
    // Show error
    src.on('error', function (err) {
        if (err) {
            return res.status(500).send({
                message: error
            });
        }
    });

    exports.create = function (req, res) {
        console.log("item listing entered")

        var ItemData = {
            Itemid: req.params.Itemid,
            ItemName: req.body.ItemName,
            imageName: req.file.originalname,
            user_id: req.user.id,
            price: req.body.price,
            category: req.body.category,
            Description: req.body.Description,
            MeetupLocation: req.body.MeetupLocation,
            pickupmethod: req.body.pickupmethod

        }
        // Save to database
        itemlist.create(ItemData).then((newItem, created) => {
            if (!newItem) {
                return res.send(400, {
                    message: "error"
                });
            }
            res.redirect('itemlisted');
        })

    };

    // Save file process
    src.on('end', function () {
        // create a new instance of the Images model with request body
        var ItemData = {
            Itemid: req.param.Itemid,
            ItemName: req.body.ItemName,
            imageName: req.file.originalname,
            user_id: req.user.id,
            price: req.body.price,
            category: req.body.category,
            Description: req.body.Description,
            MeetupLocation: req.body.MeetupLocation,
            pickupmethod: req.body.pickupmethod
        }
        // Save to database
        itemlist.create(ItemData).then((newItem, created) => {
            if (!newItem) {
                return res.send(400, {
                    message: "error"
                });
            }
            res.redirect('/itemlisted');
        })

        // remove from temp folder
        fs.unlink(tempPath, function (err) {
            if (err) {
                return res.status(500).send('Something bad happened here');
            }
            // Redirect to gallery's page
            res.redirect('/itemlisted');
        });
    });
};



//Dog Toy Items Category
exports.dogtoy = function(req,res){
    sequelize.query("SELECT * from itemlists where category = :category", {replacements:{category:'Dog Toy'}, model:itemlist}).then((Categorydata)=>{
        console.log("Helloa");
        console.log(Categorydata)
        res.render("itemlist",{
            itemlist : Categorydata,
        })
    })
}


// //test data 
// var sql = "INSERT INTO responses (user, response) VALUES ('test_user', 'A')";
// connection.query(sql, function (err, result) {
//      if (err) throw err;
//      console.log("1 record inserted");

// });
// connection.end();






// Images authorization middleware
exports.hasAuthorization = function (req, res, next) {
    console.log("authenticated: " + req.isAuthenticated);
    if (true) {

        return next();
    }
    res.redirect('/login');
};


