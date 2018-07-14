// load passport module
var LocalStrategy = require('passport-local').Strategy;
// load up the user model
var User = require('../models/users');

module.exports = function (passport) {
    // passport init setup
    // serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    // deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id).then(function (user) {
            if (user) {
                done(null, user.get());
            } else {
                done(user.errors, null);
            }
        });
    });
    // using local strategy
    passport.use('local-login', new LocalStrategy({
        // change default username and password, to email and password
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {
            if (email)
                // format to lower-case
                email = email.toLowerCase();

            var isValidPassword = function (userpass, password) {
                return userpass === password;
            }
            // process asynchronous
            process.nextTick(function () {
                User.findOne({ where: { email: email } }).then((user) => {
                    // check errors and bring the mess  ages
                    if (!user)
                        return done(null, false, req.flash('loginMessage', 'No such user found.'));
                    if (!isValidPassword(user.password, password))
                        return done(null, false, req.flash('loginMessage', 'Wrong password!'));
                    // everything ok, get user
                    else {
                        return done(null, user.get());
                    }
                }).catch((err) => {
                    console.log("Error:", err);
                    return done(err, false, req.flash('loginMessage', 'Error!'))
                });
            });
        }));
    // Signup local strategy
    passport.use('local-signup', new LocalStrategy({
        // change default username and password, to email and password
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {
            if (email)
                // format to lower-case
                email = email.toLowerCase();
            // asynchronous
            process.nextTick(function () {
                // if the user is not already logged in:
                if (!req.user) {
                    User.findOne({ where: { email: email } }).then((user) => {
                        // check email
                        if (user) {
                            return done(null, false, req.flash('signupMessage', 'Wohh! the email is already taken.'));
                        } else {
                            // create the user
                            var userData = {
                                name: req.body.name,
                                username: req.body.username,
                                phone: req.body.phone,
                                email: email,
                                password: password
                            }

                            // save data
                            User.create(userData).then((newUser, created) => {
                                if (!newUser) {
                                    return done(null, false);
                                }
                                if (newUser) {
                                    return done(null, newUser);
                                }
                            })
                        }
                    }).catch((err) => {
                        console.log("Error:", err);
                        return done(err, false, req.flash('signupMessage', 'Error!'))
                    });
                } else {
                    return done(null, req.user);
                }
            });
        }));
};
