////////////////////////////////////
////////// IMPORT MODULES //////////
////////////////////////////////////
var express = require('express');
var path = require('path');
var app = express();
var paypal = require('paypal-rest-sdk');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multer = require('multer');
var upload = multer({ dest: './public/uploads/', limits: { filesize: 1500000, files: 1} });
var stripe = require("stripe")("sk_test_mjPvQTYjNImEEt3PTQk3KpbZ");
var exphbs = require('express-handlebars');

//Setup chat
var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);
var chatConnections = 0;
var ChatMsg = require('./models/chatMsg');

io.on('connection', function(socket) {
    chatConnections++;
    console.log("Num of chat users connected: "+chatConnections);
    
    socket.on('disconnect', function() {
        chatConnections++;
        console.log("Num of chat users connected: "+chatConnections);
    });
})

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AXLNohjxp86UfQQ3DD11Ah6kMQ8i3ZTuprLYshS8nc_OhS8M1Ot1W57jbwjz140-3pRA6KhbAgq5_AcD',
    'client_secret': 'EC8xYilzzi9A5ndaAOIGMEOv_VtMX-gcdadzShjoP4HmdioYG0tFJOq9U7WGAyxze6cj41A84a8JYQmC',
  });

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

//middleware
app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

////////////////////////////////
////// IMPORT CONTROLLERS //////
////////////////////////////////
var auth = require('./controllers/auth');
var home = require('./controllers/home');
var transaction = require('./controllers/transaction');


// Import controllers
var home = require('./controllers/home');
var cart = require('./controllers/cart');
var chat = require('./controllers/chat');
var cancel = require('./controllers/cancel');
var paypal = require('./controllers/paypal');
var checkout = require('./controllers/checkout');
var itemlist= require('./controllers/itemlistController');
var servicelist = require('./controllers/servicelistC');
var admin = require('./controllers/admin');
var checkoutcard = require('./controllers/checkoutcard');


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

// check if logged in before continuing to routes
// values for login:
// 0: not logged in
// 1: normal log in
// 2: admin log in
app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        req.user.id == 101 ? res.locals.login = 2 : res.locals.login = 1;
    }
    else { res.locals.login = 0; }
    next();
})

//////////////////////////
///////// ROUTES /////////
//////////////////////////
app.get("/", home.show);

/////////////////////////////////////////////////
////>>>>>>  Beginning of Users  >>>>>>
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
app.get('/profile', auth.isLoggedIn, auth.profile);
// Logout
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

//Routes for chat
// app.get('/chat', chat.hasAuthorization, chat.list);
// app.post('/chat', chat.hasAuthorization, chat.create);

// Setup chat
var io = require('socket.io')(httpServer);
var chatConnections = 0;
var ChatMsg = require('./models/chatMsg');

app.get('/messages', function (req, res) {
    ChatMsg.findAll().then((chatMessages) => {
        res.render('chatMsg', {
            url: req.protocol + "://" + req.get("host") + req.url,
            data: chatMessages
        });
    });
});
app.post('/messages', function (req, res) {
    var chatData ={
        name: req.body.name,
        message: req.body.message
    }
    //Save into database
    ChatMsg.create(chatData).then((newMessage) => {
        if (!newMessage) {
            sendStatus(500);
        }
        io.emit('message', req.body)
        res.sendStatus(200)
    })
});

////<<<<<< End of Users <<<<<<
/////////////////////////////////////////////////

/////////////////////////////////////////////////
////>>>>>>  Beginning of Payment  >>>>>>
app.get("/cart", cart.show);
app.post('/pay/:transaction_id', paypal.show);
app.get('/success/:transaction_id', paypal.success);
app.get('/checkout/:transaction_id', checkout.showDetails);
app.post('/checkout/:transaction_id', paypal.show);
app.get('/checkoutcard/:transaction_id', checkoutcard.show);
app.post("/savecard", checkoutcard.create);
app.get('/cancel', (req, res) => {
    res.render('cancel')
});
////<<<<<< End of Payment <<<<<<
/////////////////////////////////////////////////

//////////////////////////////////////////////////////
////>>>>>>  Beginning of Transactions  >>>>>>
app.get("/transactions", transaction.hasAuthorization, transaction.showAll);
app.post("/transactions", transaction.create);
app.get("/transactions/:transaction_id", transaction.showDetails);
app.post("/transactions/:transaction_id", transaction.afterPayment);

// Admin
app.get("/admin", auth.isAdmin, admin.show);
app.post("/admin/search", auth.isAdmin, admin.search)
////<<<<<< End of Transactions <<<<<<
//////////////////////////////////////////////////////

//////////////////////////////////////////////////////
////>>>>>>  Beginning of Listings  >>>>>>
app.get("/itemlisted", itemlist.show); 
app.post("/itemlisted", itemlist.hasAuthorization, upload.single('image'), itemlist.uploadImage);
app.get("/item/:Itemid", itemlist.showDetails);

app.get("/servicelisted", servicelist.show);
app.post("/servicelisted", servicelist.hasAuthorization, upload.single('imageName'), servicelist.uploadService);

////<<<<<< End of Listings <<<<<<
//////////////////////////////////////////////////////


//Charge route
app.post("/charge/:transaction_id", checkoutcard.charge);


// Listening
var server = app.listen(3000, () => {
    console.log('Listening on port', server.address().port);
});