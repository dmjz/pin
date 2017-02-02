'use strict';

var express = require('express');
var routes = require('./app/index.js');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();

mongoose.connect('mongodb://' + process.env.IP + '/booksdjmot', function (err) {
    if (err) { console.log('mongoose connection error'); }
    else { console.log('mongoose connected'); }
});

app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());

routes(app);
    
app.listen(process.env.PORT, process.env.IP, function () {
	console.log('Node.js listening on port ' + process.env.PORT);
});