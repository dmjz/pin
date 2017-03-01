'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Image = new Schema({
    contentType: String,
    path: String
});

module.exports = mongoose.model('Image', Image);