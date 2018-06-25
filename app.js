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
var success = require('./controllers/success');
var cancel = require('./controllers/cancel')


// View engine ejs
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes/Routers
app.get("/", home.show);
app.get("/cart", cart.show);


app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "252.00"
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.render('success');
      }
  });
  });



app.post('/pay', (req, res) => {
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:3000/success",
          "cancel_url": "http://localhost:3000/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": "Red Sox Hat",
                  "sku": "001",
                  "price": "252.00",
                  "currency": "USD",
                  "quantity": 1
              }]
          },
          "amount": {
              "currency": "USD",
              "total": "252.00"
          },
          "description": "Hat for the best team ever"
      }]
  };
  
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
    }
  });
  
  });
  
 
  
app.get('/cancel', (req, res) => {
    res.render('cancel')
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
    res.render('404');
});

// Listening
var server = app.listen(3000, () => {
    console.log('Listening on port', server.address().port);
});


