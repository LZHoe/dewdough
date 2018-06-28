// Import modules
var express = require('express');
var path = require('path');
var app = express();
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

app.get("/transactions", transaction.showAll);
app.post("/transactions", transaction.create);
app.get("/transactions/:transaction_id", transaction.showDetails);
app.post("/transactions/:transaction_id", transaction.testpay);

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