'use strict';

var express = require('express');
var routes = require('./app/index.js');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var multer = require('multer');
var upload = multer({dest: './uploads/'});
var app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect('mongodb://' + process.env.IP + '/pin', function (err) {
    if (err) { console.log('mongoose connection error: ' + err); }
    else { console.log('mongoose connected'); }
});

app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(session({
    secret: 'HoWdYpArDnErS',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

routes(app, passport, upload);
    
app.listen(process.env.PORT, process.env.IP, function () {
	console.log('Node.js listening on port ' + process.env.PORT);
});