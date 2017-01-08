'use strict';

var express = require('express');
var routes = require('./app/index.js');
var app = express();

app.use('/public', express.static(process.cwd() + '/public'));

routes(app);
    
app.listen(process.env.PORT, process.env.IP, function () {
	console.log('Node.js listening on port ' + process.env.PORT);
});