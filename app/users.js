'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    twitter: { id: String, name: String },
    pins: []
});

module.exports = mongoose.model('User', User);