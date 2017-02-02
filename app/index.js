'use strict';

var path = process.cwd();
var UserHandler = require(path + '/app/userHandler.js');

module.exports = function (app) {
    
    var userHandler = new UserHandler();
    
    /*
        Just file serving
    */
    app.route('/')
        .get(function (req, res) {
            res.sendFile(path + '/public/home.html');
        });
    app.route('/books')
        .get(function (req, res) {
            res.sendFile(path + '/public/books.html');
        });
    app.route('/profile')
        .get(function (req, res) {
            res.sendFile(path + '/public/profile.html');
        });
    app.route('/login')
        .get(function (req, res) {
            res.sendFile(path + '/public/login.html');
        });
    app.route('/signup')
        .get(function (req, res) {
            res.sendFile(path + '/public/signup.html');
        });
    app.route('/trade')
        .get(function (req, res) {
            res.sendFile(path + '/public/trade.html');
        });
    app.route('/mybooks')
        .get(function (req, res) {
            res.sendFile(path + '/public/mybooks.html');
        });
        
    /*
        User API
    */
    app.route('/user/add')
        .post(function (req, res) {
            userHandler.addUser(req, res);
        });
    app.route('/user/login')
        .post(function (req, res) {
            userHandler.login(req, res);
        });
    app.route('/user/get')
        .post(function (req, res) {
            userHandler.getUser(req, res);
        });
    app.route('/user/searchusers')
        .post(function (req, res) {
            userHandler.searchUsers(req, res);
        });
    app.route('/user/update')
        .post(function (req, res) {
            userHandler.saveSettings(req, res);
        });
    app.route('/user/newbook')
        .post(function (req, res) {
            userHandler.newBook(req, res);
        });
    app.route('/user/addbook')
        .post(function (req, res) {
            userHandler.addBook(req, res);
        });
    app.route('/user/removebook')
        .post(function (req, res) {
            userHandler.removeBook(req, res);
        });
    app.route('/user/searchbooks')
        .post(function (req, res) {
            userHandler.searchBooks(req, res);
        });
    app.route('/user/allbooks')
        .post(function (req, res) {
            userHandler.allBooks(req, res);
        });
    app.route('/user/addtrade')
        .post(function (req, res) {
            userHandler.addTrade(req, res);
        });
    app.route('/user/removetrade')
        .post(function (req, res) {
            userHandler.removeTrade(req, res);
        });
    app.route('/user/processtrade')
        .post(function (req, res) {
            userHandler.processTrade(req, res);
        });
};