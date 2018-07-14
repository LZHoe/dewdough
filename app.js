// Import modules
var express = require('express');
var path = require('path');
var app = express();
var paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AXLNohjxp86UfQQ3DD11Ah6kMQ8i3ZTuprLYshS8nc_OhS8M1Ot1W57jbwjz140-3pRA6KhbAgq5_AcD',
    'client_secret': 'EC8xYilzzi9A5ndaAOIGMEOv_VtMX-gcdadzShjoP4HmdioYG0tFJOq9U7WGAyxze6cj41A84a8JYQmC',
  });

//import login controller
var auth = require('./controllers/auth');

//modules to store function
var myDatabase = require('./controllers/database');
var expressSession = require('express-session')
var SessionStore = require('express-session-sequelize')(expressSession.Store);
var sequelizeSessionStore = new SessionStore({
    db: myDatabase.sequelize,
});

//import passport and warning flash modules
var passport = require('passport');
var flash = require('connect-flash');

var app = express();
var ServerPort = 3000;
var httpServer = require('http').Server(app);

//passport config
require('./config/passport')(passport);

var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

// Import controllers
var home = require('./controllers/home');
var transaction = require('./controllers/transaction');
var home = require('./controllers/home');
var cart = require('./controllers/cart');
var cancel = require('./controllers/cancel');
var paypal = require('./controllers/paypal');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));

// View engine ejs
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

// Static files
app.use(express.static(path.join(__dirname, 'public')));

//required for passport
//secret for session
app.use(expressSession({
    secret: 'sometextgohere',
    store: sequelizeSessionStore,
    resave: false,
    saveUninitialized: false,
}));
//init passport authentication
app.use(passport.initialize());
//persistent login sesh
app.use(passport.session());
//flash messages
app.use(flash());

//check if logged in before continuing to routes
app.use((req, res, next) => {
    res.locals.login = req.isAuthenticated();
    next();
})
// Routes/Routers
app.get("/", home.show);
app.get("/login", auth.signin);
app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/signup', auth.signup);
app.post('/signup', passport.authenticate('local-signup', {
    //Success go to Profile Page / Fail go to Signup page
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
}));

app.get("/cart", cart.show);

app.post('/pay', paypal.show);

app.get('/success/:transaction_id', paypal.success);

  
app.get('/cancel', (req, res) => {
    res.render('cancel')
});
app.get("/transactions", transaction.showAll);
app.post("/transactions", transaction.create);
app.get("/transactions/:transaction_id", transaction.showDetails);
app.post("/transactions/:transaction_id", transaction.testpay);
// Logout
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// 404 handling
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('404', {
        title: "Error 404"
    });
});


// Listening
var server = app.listen(3000, () => {
    console.log('Listening on port', server.address().port);
});