'use strict';

var TwitterStrategy = require('passport-twitter').Strategy;
var User = require('../users.js');
var configAuth = require('./auth.js');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	passport.use(new TwitterStrategy({
		consumerKey: configAuth.twitterAuth.consumerKey,
		consumerSecret: configAuth.twitterAuth.consumerSecret,
		callbackURL: configAuth.twitterAuth.callbackURL
	}, function (token, tokenSecret, profile, done) {
		process.nextTick(function () {
			User.findOne({ 'twitter.id': profile.id }, function (err, user) {
				if (err) { return done(err); }
				if (user) { return done(null, user); }
				
				var newUser = new User();
				newUser.twitter.id = profile.id;
				newUser.twitter.name = profile.username;
				newUser.pins = [];
				newUser.save(function (err) {
					if (err) { throw err; }
					return done(null, newUser);
				});
			});
		});
	}));
};