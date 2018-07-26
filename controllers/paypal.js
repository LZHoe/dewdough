var Transactions = require('../models/transaction');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var paypal = require('paypal-rest-sdk');

// Show
exports.show = function(req,res) {
    var transaction_id = req.params.transaction_id;
    sequelize.query('SELECT transactionId,offer,qty,listingId FROM Transactions WHERE transactionId = ' + transaction_id,{model:Transactions}).then((Transactions)=>{

        Transactions = Transactions[0];
        console.log(Transactions)
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/success/" + transaction_id, 
                "cancel_url": "http://localhost:3000/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Red Sox Hat",
                        "sku": Transactions.listingId,
                        "price": Transactions.offer,
                        "currency": "SGD",
                        "quantity": "001",
                    }]
                },
                "amount": {
                    "currency": "SGD",
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
    sequelize.query('SELECT transactionId,offer FROM Transactions WHERE transactionId = ' + transaction_id,{model:Transactions}).then((instance)=>{
        instance = instance[0];
        console.log(instance);
        var payerId = req.query.PayerID;
        var paymentId = req.query.paymentId;
      
        const execute_payment_json = {
          "payer_id": payerId,
          "transactions": [{
              "amount": {
                  "currency": "SGD",
                  "total": instance.offer,
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
              console.log(transRef)
    
              //push to DB
              var paypaldata = {
                  paymentId : paymentiddata,
                  paymentMethod : paymentmethod,
                  status: 'Delivering',
                  transactionId: transRef
              };
    
              Transactions.update(paypaldata, { where: { transactionId: transRef }, id: req.user.id, action: 'PAID' }).then((updatedRecord) => {
                if (!updatedRecord || updatedRecord == 0) {
                    return res.send(400, {
                        message: "error"
                    });
                }
            });
        }

        // Show test data
        res.redirect('/transactions/' + transRef);
    })
})
}



// Comments authorisation middleware
exports.hasAuthorization = function (req,res,next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}