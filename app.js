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