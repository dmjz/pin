'use strict';

var path = process.cwd();
var DbHandler = require(path + '/app/dbHandler.js');

module.exports = function (app, passport, upload) {
    
    function isLoggedIn (req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        else { res.redirect('/public/login.html'); }
    }
    
    var dbHandler = new DbHandler();
        
    
    /*
        Authentication/login-logout
    */
    app.route('/auth/twitter')
		.get(passport.authenticate('twitter'));
	app.route('/auth/twitter/callback')
		.get(passport.authenticate('twitter', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});
		
		
	/*
        File serving
    */
    app.route('/')
        .get(isLoggedIn, function (req, res) {
            res.sendFile(path + '/public/home.html');
        });
    app.route('/profile')
        .get(isLoggedIn, function (req, res) {
            res.sendFile(path + '/public/profile.html');
        });
    app.route('/public')
        .get(isLoggedIn, function (req, res) {
            res.sendFile(path + '/public/public.html');
        });
        
        
    /*
        Api
    */
    app.route('/user/me')
        .get(isLoggedIn, function(req, res) {
            dbHandler.getUserMe(req, res);
        });
    app.route('/user/pins')
        .get(isLoggedIn, function(req, res) {
            dbHandler.getUserPins(req, res);
        });
    app.route('/pin/upload')
        .post(isLoggedIn, upload.single('image'), function (req, res) {
            dbHandler.handleUpload(req, res);
        });
    app.route('/pin/all')
        .get(isLoggedIn, function(req, res) {
            dbHandler.getAllPins(req, res);
        });
    app.route('/pin/user')
        .get(isLoggedIn, function (req, res) {
            dbHandler.getPins(req, res);
        });
    app.route('/pin/like')
        .post(isLoggedIn, function (req, res) {
            dbHandler.likePin(req, res);
        });
    app.route('/pin/unlike')
        .post(isLoggedIn, function (req, res) {
            dbHandler.unlikePin(req, res);
        });
    app.route('/pin/delete')
        .get(isLoggedIn, function (req, res) {
            dbHandler.deletePin(req, res);
        });
};