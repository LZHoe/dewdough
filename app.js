// Import modules
var express = require('express');
var path = require('path');
var app = express();
var paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AZSW_6ogC7vKYSqG8ySFg2HWIk-ac-ByTCSHvkHzXZyA67zCW7uAX6hpTbx__8s1PW27taSnzNq4CNEa',
    'client_secret': 'ENzpKzd4Re1TO5-HP3rYhu4dTpb64eBv-z84JGbMQw0LyaGwHD_z1xJIzPfL1xn7Fif4fegiTrhRRVxz',
  });

// Import controllers
var home = require('./controllers/home');
var cart = require('./controllers/cart');
var cancel = require('./controllers/cancel');
var paypal = require('./controllers/paypal');


// View engine ejs
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes/Routers
app.get("/", home.show);
app.get("/cart", cart.show);

app.post('/pay', paypal.show);
  
app.get('/success', paypal.success);
  
app.get('/cancel', (req, res) => {
    res.render('cancel')
});


// Listening
var server = app.listen(3000, () => {
    console.log('Listening on port', server.address().port);
});