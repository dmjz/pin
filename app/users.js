'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    username: String,
    password: String,
    name: String,
    email: String,
    city: String,
    state: String,
    books: Array,
    tradeRequests: {
        in: Array,
        out: Array
    }
});

module.exports = mongoose.model('User', User);