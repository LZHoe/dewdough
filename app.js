// Import modules
var express = require('express');
var path = require('path');
var app = express();

// Import controllers
var home = require('./controllers/home');

// View engine ejs
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes/Routers
app.get("/", home.show);

// 404 handling
app.use(function(req, res, next) {
    res.status(404).sendFile('404.ejs', {root: publicPath});
  });

// Listening
var server = app.listen(3000, () => {
    console.log('Listening on port', server.address().port);
});