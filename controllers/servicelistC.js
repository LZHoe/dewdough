var fs = require('fs');
var mime = require('mime');
var gravatar = require('gravatar');


//set file types
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

var servicelistM = require('../models/servicelistM');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var moment = require('moment');

// function to convert date from sql to more readable format using moment js
function convertDate(myDate) {
    var dateObj = moment(myDate);
    var newDate = moment(dateObj).calendar();
    return newDate;
}
//services listed gallery 
exports.show = function (req, res) {
    sequelize.query('select sl.*, u.username from servicelists sl INNER JOIN Users u \
    ON sl.user_id = u.id WHERE sl.user_id = ' + req.user.id + ' AND sl.visible = 1'
        , { type: sequelize.QueryTypes.SELECT }).then((servicelist) => {
            for (var i = 0; i < servicelist.length; i++) {
                servicelist[i].createdAt = convertDate(servicelist[i].createdAt);
                servicelist[i].updatedAt = convertDate(servicelist[i].updatedAt);
            }
            res.render('servicelist', {
                title: 'Service Listed',
                servicelist: servicelist,
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
    var serviceid = req.params.serviceid;
    sequelize.query('select sl.*, u.username from servicelists sl INNER JOIN Users u \
    ON sl.user_id = u.id WHERE sl.serviceid = ' + serviceid
        , { type: sequelize.QueryTypes.SELECT }).then((servicepage) => {
            res.render('servicePage', {
                title: 'Service Details',
                servicelist: servicepage[0]
            })
        }).catch((err) => {
            return res.status(400).send({
                message: err
            })
        })
}
exports.editServiceRecord = function (req, res) {
    var serviceid = req.params.serviceid;
    servicelistM.findById(serviceid).then(function (serviceRecord) {
        res.render('editService', {
            title: "Edit Service Listing",
            service: serviceRecord,
            hostPath: req.protocol + "://" + req.get("host")
        });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        })
    })
}

exports.update = function (req, res) {
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
    targetPath = './public/service_img/' + req.file.originalname;
    //read stream API to read files 
    src = fs.createReadStream(tempPath);
    //write stream API to write file 
    dest = fs.createWriteStream(targetPath);
    src.pipe(dest);
    //show error 
    src.on('error', function (err) {
        if (err) {
            return res.status(500).send({
                message: err
            });
        }
    });
    src.on('end', function () {
        var serviceid = req.params.serviceid;
        var updateService = {

            serviceid: req.params.serviceid,
            servicetitle: req.body.servicetitle,
            imageName: req.file.originalname,
            user_id: req.user.id,
            serviceprice: req.body.serviceprice,
            servicecategory: req.body.servicecategory,
            servicedescription: req.body.servicedescription,
            servicelocation: req.body.servicelocation,
            servicepickup: req.body.servicepickup
        }
        console.log("\n\n\n\n\n" + req.body.servicedescription);
        servicelistM.update(updateService, { where: { serviceid: serviceid } }).then((updatedService) => {
            if (!updateService || updateService == 0) {
                return res.send(400, {
                    message: "error"
                });
            }
            res.status(200).send({ message: "updated Service record: " + serviceid });
        });
                // remove from temp folder

        fs.unlink(tempPath, function (err) {
            if (err) {
                return res.status(500).send('Something bad happened here');
            }
            // Redirect to gallery's page
            res.redirect('/servicelisted');
        });
    });
 
};

exports.delete = function (req, res){
    var serviceid = req.params.serviceid;
        var updateService = {
            visible: false 
        }
        servicelistM.update(updateService, { where: { serviceid: serviceid } }).then((updatedService) => {
            if (!updateService || updateService == 0) {
                return res.send(400, {
                    message: "error"
                });

            }
            res.redirect("/servicelisted");
        });

}

exports.showCat = function (req, res) {
    // Show item details
    sequelize.query('select sl.*, u.username from servicelists sl \
    INNER JOIN Users u ON sl.user_id = u.id \
    WHERE sl.servicecategory LIKE \'%Cat%\' ',
         { type: sequelize.QueryTypes.SELECT }).then((servicepage) => {
            for (var i = 0; i < servicepage.length; i++) {
                servicepage[i].createdAt = convertDate(servicepage[i].createdAt);
                servicepage[i].updatedAt = convertDate(servicepage[i].updatedAt);
            }
            res.render('allServices', {
                title: 'Cat Services',
                servicelist: servicepage
            })
        }).catch((err) => {
            return res.status(400).send({
                message: err
            })
        })
}

exports.showDog = function (req, res) {
    // Show item details
    sequelize.query('select sl.*, u.username from servicelists sl \
    INNER JOIN Users u ON sl.user_id = u.id \
    WHERE sl.servicecategory LIKE  \'%Dog%\' ',
         { type: sequelize.QueryTypes.SELECT }).then((servicepage) => {
            for (var i = 0; i < servicepage.length; i++) {
                servicepage[i].createdAt = convertDate(servicepage[i].createdAt);
                servicepage[i].updatedAt = convertDate(servicepage[i].updatedAt);
            }
            res.render('allservices', {
                title: 'Dog Services',
                servicelist: servicepage
            })
        }).catch((err) => {
            return res.status(400).send({
                message: err
            })
        })
}

//image upload
exports.uploadService = function (req, res) {

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
    targetPath = './public/service_img/' + req.file.originalname;
    //read stream API to read files 
    src = fs.createReadStream(tempPath);
    //write stream API to write file 
    dest = fs.createWriteStream(targetPath);
    src.pipe(dest);

    //show error 
    src.on('error', function (err) {
        if (err) {
            return res.status(500).send({
                message: err
            });
        }
    });

    // create service listing


    src.on('end', function () {
        //create new instance of images model w request body
        var serviceData = {
            servicetitle: req.body.servicetitle,
            imageName: req.file.originalname,
            user_id: req.user.id,
            serviceprice: req.body.serviceprice,
            servicecategory: req.body.servicecategory,
            servicedescription: req.body.servicedescription,
            servicelocation: req.body.servicelocation,
            servicepickup: req.body.servicepickup

        }
        //save to database
        servicelistM.create(serviceData).then((newServiceData, created) => {
            if (!newServiceData) {
                return res.send(400, {
                    message: "error"
                });
            }
            // res.redirect('servicelisted');
        })

        //remove from temp folder
        fs.unlink(tempPath, function (err) {
            if (err) {
                return res.status(500).send('Something bad happened here');
            }
            res.redirect('servicelisted');
        });
    });

};



exports.doggrooming = function(req,res){
    sequelize.query("SELECT * from servicelists where servicecategory = :category AND visible = 1", {replacements:{category:'Dog Grooming'}, model:servicelistM}).then((Categorydata)=>{
        for (var i = 0; i < Categorydata.length; i++) {
            Categorydata[i].dataValues.createdAt = convertDate(Categorydata[i].createdAt);
        }
        res.render("allServices",{
            servicelist : Categorydata,
        })
    })
}

exports.dogboarding = function(req,res){
    sequelize.query("SELECT * from servicelists where servicecategory = :category AND visible = 1", {replacements:{category:'Dog Boarding'}, model:servicelistM}).then((Categorydata)=>{
        for (var i = 0; i < Categorydata.length; i++) {
            Categorydata[i].dataValues.createdAt = convertDate(Categorydata[i].createdAt);
        }
        res.render("allServices",{
            servicelist : Categorydata,
        })
    })
}

exports.catgrooming = function(req,res){
    sequelize.query("SELECT * from servicelists where servicecategory = :category AND visible = 1", {replacements:{category:'Cat Grooming'}, model:servicelistM}).then((Categorydata)=>{
        for (var i = 0; i < Categorydata.length; i++) {
            Categorydata[i].dataValues.createdAt = convertDate(Categorydata[i].createdAt);
        }
        res.render("allServices",{
            servicelist : Categorydata,
        })
    })
}


exports.catdaycare = function(req,res){
    sequelize.query("SELECT * from servicelists where servicecategory = :category AND visible = 1", {replacements:{category:'Cat Daycare'}, model:servicelistM}).then((Categorydata)=>{
        for (var i = 0; i < Categorydata.length; i++) {
            Categorydata[i].dataValues.createdAt = convertDate(Categorydata[i].createdAt);
        }
        res.render("allServices",{
            servicelist : Categorydata,
        })
    })
}

exports.catboarding = function(req,res){
    sequelize.query("SELECT * from servicelists where servicecategory = :category AND visible = 1", {replacements:{category:'Cat Boarding'}, model:servicelistM}).then((Categorydata)=>{
        for (var i = 0; i < Categorydata.length; i++) {
            Categorydata[i].dataValues.createdAt = convertDate(Categorydata[i].createdAt);
        }
        res.render("allServices",{
            servicelist : Categorydata,
        })
    })
}






exports.dogdaycare= function(req,res){
    sequelize.query("SELECT * from servicelists where servicecategory = :category AND visible = 1", {replacements:{category:'Dog Daycare'}, model:servicelistM}).then((Categorydata)=>{
        for (var i = 0; i < Categorydata.length; i++) {
            Categorydata[i].dataValues.createdAt = convertDate(Categorydata[i].createdAt);
        }
        console.log("Helloa");
        console.log(Categorydata)
        res.render("allServices",{
            servicelist : Categorydata,
        })
    })
}



exports.hasAuthorization = function (req, res, next) {
    console.log("authenticated: " + req.isAuthenticated);
    if (true) {

        return next();
    }
    res.redirect('/login');
};
