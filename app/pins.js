'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pin = new Schema({
    owner: String,
    name: String,
    url: String,
    likes: Number,
    likers: []
});

module.exports = mongoose.model('Pin', Pin);