// Import modules
var fs = require('fs');
var mime = require('mime');
var gravatar = require('gravatar');

// set image file types
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

var itemlist = require('../models/itemlist');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;

// Show images gallery -  function to get all the uploaded images from the database and show it on the page. 
exports.show = function (req, res) {

    sequelize.query('select * from itemlists'
    , { model: itemlist}).then((itemlist)=> {

        res.render('itemlist', {
            title: 'CUTE ITEMS HEHE',
            itemlist: itemlist,
            user: "2"
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
    sequelize.query('SELECT * FROM itemlists WHERE Itemid = ' + Itemid, { model: itemlist }).then((itempage) => {
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
    src.on('error', function(err) {
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
            MeetupLocation: req.MeetupLocation,
            pickupmethod: req.pickupmethod
            
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
    src.on('end', function() {
        // create a new instance of the Images model with request body
        var ItemData = {
            Itemid: req.param.Itemid, 
            ItemName: req.body.ItemName,
            imageName: req.file.originalname,
            user_id: req.user.id,
            price: req.body.price,
            category: req.body.category,
            Description: req.body.Description,
            MeetupLocation: req.MeetupLocation,
            pickupmethod: req.pickupmethod

            
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




// Images authorization middleware
exports.hasAuthorization = function(req, res, next) {
    console.log("authenticated: " + req.isAuthenticated);
    if (true){
        
        return next();
    }
    res.redirect('/login');
};