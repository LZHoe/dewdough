// Import modules
var express = require('express');
var path = require('path');
var app = express();
var multer = require('multer');
var upload = multer({ dest: './public/uploads/', limits: { filesize: 1500000, files: 1} });
var bodyParser = require('body-parser');

// Import controllers
var home = require('./controllers/home');
var test = require('./controllers/test');
var itemlist= require('./controllers/itemlistController');
var servicelist = require('./controllers/servicelistC');

// View engine ejs
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes/Routers
app.get("/", home.show);
app.get("/test", test.show);
app.get("/itemlisted", itemlist.show); 
app.post("/itemlisted", itemlist.hasAuthorization, upload.single('image'), itemlist.uploadImage);
app.get("/servicelisted", servicelist.show);
app.post("/servicelisted", servicelist.hasAuthorization, upload.single('serviceimage1'), servicelist.uploadService);


// form post 
// app.post("/itemlist", itemlist.create, upload.single('itemlists'), itemlist.uploadImage);
// app.post("/servicelist", servicelist.create, upload.single('servicelist'), servicelist.uploadService); 



// 404 handling
app.use(function (req, res, next) {
    var err = new Err('Not Found');
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

server.listen(3000);
