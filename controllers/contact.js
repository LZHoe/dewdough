////////////////////////////////////////////////
//// Start a transaction with initial offer ////
////////////////////////////////////////////////
exports.create = function (req, res) {
    var initialPrice = 0;
    sequelize.query("SELECT price FROM itemlists WHERE Itemid = :listingid", { replacements: { listingid: req.body.listingId }, model: itemlists }).then((results) => {

        // retreive user input
        var transactionData = {
            qty: req.body.qty,
            listingId: req.body.listingId,
            buyerId: req.user.id,
            offer: results[0].price
        };

        // after retreiving, push into db
        Transaction.create(transactionData).then((newTransaction, created) => {
            if (!newTransaction) {
                return res.send(400, {
                    message: "error"
                });
            }

            console.log("New transaction successful");
            res.redirect('/transactions');
        });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        })
    })
}
