var Transactions = require('../models/transaction');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var paypal = require('paypal-rest-sdk');

// Show
exports.show = function(req,res) {
    var transaction_id = req.params.transaction_id;
    sequelize.query('SELECT transactionId,offer FROM Transactions WHERE transactionId = ' + transaction_id,{model:Transactions}).then((Transactions)=>{
        console.log(Transactions);
        Transactions = Transactions[0];
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "Paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/success/" + transaction_id, // <--------- change this hard code eventually
                "cancel_url": "http://localhost:3000/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Red Sox Hat",
                        "sku": "001",
                        "price": Transactions.offer,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": Transactions.offer,
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
    
    })
}
    // Success
exports.success = function(req,res) {
    var transaction_id = req.params.transaction_id;
    sequelize.query('SELECT transactionId,offer FROM Transactions WHERE transactionId = ' + transaction_id,{model:Transactions}).then((Transactions)=>{
        console.log(Transactions);
        Transactions = Transactions[0];
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
      
        const execute_payment_json = {
          "payer_id": payerId,
          "transactions": [{
              "amount": {
                  "currency": "USD",
                  "total": Transactions.offer,
              }
          }]
        }
      
        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
          if (error) {
              console.log(error.response);
              throw error;
          } else {
              paymentmethod = payment.payer.payment_method;
              paymentiddata = payment.id;
              // payeremail = payment.payer.payer_info.email;
              transRef = req.params.transaction_id;
              console.log(JSON.stringify(payment));
              console.log(paymentiddata);
              console.log(paymentmethod)
    
              //push to DB
              var paypaldata = {
                  paymentId : paymentiddata,
                  paymentMethod : paymentmethod,
                  status: 'Delivering',
                  transactionId: transRef
              }
    
              Transactions.update(paypaldata, { where: { transactionId: transRef } }).then((updatedRecord) => {
                if (!updatedRecord || updatedRecord == 0) {
                    return res.send(400, {
                        message: "error"
                    });
                }
            });
            res.render('success',{
                title:'successdata',
                data: Transactions[0]
            })
        
        }

        // Show test data
        sequelize.query('SELECT * FROM Transactions', { model: Transactions }).then((data) => {
            res.render('success', {
                title: 'Payment successful',
                data: data
            })
        }).catch((err) => {
            return res.status(400).send({
                message: err
            })
        })        
    })
})
}



// Comments authorisation middleware
exports.hasAuthorization = function (req,res,next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}