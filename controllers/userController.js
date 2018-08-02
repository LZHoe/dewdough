var users = require('../models/users');
var myDatabase = require('./database')
var sequelizeInstance = myDatabase.sequelizeInstance;

exports.editProfile = function(req, res) {
    var record_num = req.user.id;
    users.findById(record_num).then(function
    (userRecord) {
        res.render('editProfile', {
            title: 'Edit Profile',
            user: userRecord,
            hostPath: req.protocol + "://" + req.get("host") 
        });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
};

exports.updateProfile = function (req, res) {
    var record_num = req.params.id;
    var updateData = {
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        phone: req.body.phone,
        password: req.body.password
    }
    users.update(updateData, {where: {id:record_num}})
    .then((updatedRecord) => {
        if (!updatedRecord || updatedRecord == 0) {
            return res.send(400, {
                message: "error"
            });
        }
        res.status(200).send({message: "Updated User Record:" + record_num});
    })
}

