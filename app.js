// Import modules
var express = require('express');
var path = require('path');
var app = express();
var paypal = require('paypal-rest-sdk');
var stripe = require("stripe")("sk_test_mjPvQTYjNImEEt3PTQk3KpbZ");
var exphbs = require('express-handlebars');


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AXLNohjxp86UfQQ3DD11Ah6kMQ8i3ZTuprLYshS8nc_OhS8M1Ot1W57jbwjz140-3pRA6KhbAgq5_AcD',
    'client_secret': 'EC8xYilzzi9A5ndaAOIGMEOv_VtMX-gcdadzShjoP4HmdioYG0tFJOq9U7WGAyxze6cj41A84a8JYQmC',
  });

  //middleware
app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');


// Import controllers
var home = require('./controllers/home');
var cart = require('./controllers/cart');
var cancel = require('./controllers/cancel');
var paypal = require('./controllers/paypal');
var checkout = require('./controllers/checkout');
var checkoutcard = require('./controllers/checkoutcard');

var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

// Import controllers
var home = require('./controllers/home');
var transaction = require('./controllers/transaction');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// View engine ejs
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");



// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes/Routers
app.get("/", home.show);
app.get("/cart", cart.show);

app.post('/pay/:transaction_id', paypal.show);

app.get('/success/:transaction_id', paypal.success);

app.get('/checkout/:transaction_id', checkout.showDetails);
app.post('/checkout/:transaction_id', paypal.show);

app.get('/checkoutcard/:transaction_id', checkoutcard.show);
app.post("/savecard", checkoutcard.create)


app.get('/cancel', (req, res) => {
    res.render('cancel')
});

app.get("/transactions", transaction.showAll);
app.post("/transactions", transaction.create);
app.get("/transactions/:transaction_id", transaction.showDetails);
app.post("/transactions/:transaction_id", transaction.testpay);


//Charge route
app.post("/charge/:transaction_id", checkoutcard.charge);


// Listening
var server = app.listen(3000, () => {
    console.log('Listening on port', server.address().port);
});