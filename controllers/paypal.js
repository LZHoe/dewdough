var Paypal = require('../models/paypal');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;

// Show
exports.show = function(req,res) {
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
  
    Paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.render('success');
      }
  });
    // Show test data
    sequelize.query('SELECT * FROM PAYPAL', { model: Paypal }).then((data) => {
        res.render('success', {
            title: 'Payment successful',
            data: data
            // urlPath: req.protocol + "://" + req.get("host") + req.url
        })
    }).catch((err) => {
        return res.status(400).send({
            message: err
        })
    })
}

// Comments authorisation middleware
exports.hasAuthorization = function (req,res,next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}