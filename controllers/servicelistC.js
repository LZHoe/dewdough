var fs = require('fs');
var mime = require('mime');
var gravatar = require('gravatar');


//set file types
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

var servicelistM = require('../models/servicelistM');
var myDatabase = require('./database');
var seqeulize = myDatabase.sequelize;

//services listed gallery 
exports.show = function(req, res) {
    seqeulize.query('SELECT * from servicelist', 
    { model: servicelistM }).then((servicelist) => {

        res.render('servicelist', {
            title: 'Service Listed',
            servicelist: servicelist,
            gravatar: gravatar.url(images.user_id, { s: '80', r: 'x', d: 'retro'}, true),

        });

    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
        console.log(err)
    });
};


//image upload
exports.uploadService = function (req, res) {
    console.log("i am in here 2");

var src;
var dest;
var targetPath;
var targetName;
var tempPath = req.file.path;
console.log(req.file);
//get mime type of file
var type = mime.lookup(req.file.mimetype);
//file extension 
var extension = req.file.path.split(/[. ]+/).pop();
//check support file types 
if (IMAGE_TYPES.indexOf(type) == -1) {
    return res.status(415).send('Supported image formats: jpeg, jpg, jpe, png.')
}
//set new path to images 
targetPath = './public/images/' + req.file.originalname; 
//read stream API to read files 
src = fs.createReadStream(tempPath);
//write stream API to write file 
dest = fs.createWriteStream(targetPath);
src.pipe(dest);

//show error 
src.on('error', function(err) {
    if (err) {
        return res.status(500).send({
            message: err
        });
    }
});

// create service listing
exports.create = function (req, res) {
    console.log("service listing entered")

    var serviceData = {
        servicetitle: req.body.servicetitle,
        imageName: req.file.originalname,
        user_id: req.user.id,
        serviceprice: req.body.serviceprice,
        servicecategory: req.body.servicecategory,
        servicedescription: req.body.servicedescription,
        location: req.location
    }

    servicelistM.create(serviceData).then((newServiceData, created) => {
        if (!newServiceData) {
            return res.send(400, {
                message: "error"
            });
        }
        res.redirect('servicelisted');
    })

};

src.on('end', function () {
    //create new instance of images model w request body
    var serviceData = {
        servicetitle: req.body.servicetitle,
        imageName: req.file.originalname,
        user_id: "2",
        serviceprice: req.body.serviceprice,
        servicecategory: req.body.servicecategory,
        servicedescription: req.body.servicedescription,
        location: req.location
    }   
    //save to database
    servicelistM.create(serviceData).then((newServiceData, created) => {
        if (!newServiceData) {
            return res.send(400, {
                message: "error"
            });
        }
        res.redirect('/servicelisted');
    })

    //remove from temp folder
    fs.unlink(tempPath, function (err) {
        if (err) {
            return res.status(500).send('Something bad happened here');
        }
        res.redirect('/servicelisted');
    });
});

};


exports.hasAuthorization = function(req, res, next) {
    console.log("authenticated: " + req.isAuthenticated);
    if (true){
        
        return next();
    }
    res.redirect('/login');
};

