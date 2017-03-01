'use strict';

var User = require('./users.js');
var Pin = require('./pins.js');
var cloudinary = require('cloudinary');
var fs = require('fs');
var mongoose = require('mongoose');


function DbHandler () {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_KEY,
        api_secret: process.env.CLOUD_SECRET
    });
    
    
    this.getUserMe = function (req, res) {
        console.log('getUserMe, id: ' + req.user.twitter.id);
        User.findOne({'twitter.id': req.user.twitter.id}, function (err, user) {
            if (err) { return res.json({message: 'User.findOner in getUserMe'}); }
            if (!user) { return res.json({message: 'User not found in getUserMe'}); }
            res.json(user);
        });
    };
    
    
    this.getUserPins = function (req, res) {
        console.log('getUserPins');
        User.findOne({'twitter.id': req.user.twitter.id}, function (err, user) {
            if (err) { return res.json({message: 'User.findOne error in getUserPins'}); }
            if (!user) { return res.json({message: 'User not found in getUserPins'}); }
            Pin.find({
                _id: { 
                    $in: user.pins.map(function (id) { return mongoose.Types.ObjectId(id); }) }
                }, function (err, pins) {
                    if (err) { return res.json({message: 'Pin.find error in getUserPins'}); }
                    if (!pins) { return res.json({message: 'Pins not found in getUserPins'}); }
                    return res.json({pins});
            });
        });
    };
    
    
    this.handleUpload = function (req, res) { 
        console.log('handleUpload');
        if (!req.file) { return res.json({message: 'No file'}); }
        var type = req.file.mimetype;
        if (!type || !(type === 'image/gif' || type === 'image/png' || type === 'image/jpeg')) {
            return res.json({message: 'Invalid file type'});
        } else if (req.file.size > 5*Math.pow(2,20)) {
            return res.json({message: 'Image too large (max 5MB)'});
        }
        
        User.findOne({'twitter.id': req.user.twitter.id}, function (err, user) {
            if (err) { return res.json({message: 'User.find error in handleUpload'}); }
            if (!user) { return res.json({message: 'User not found in handleUpload'}); }
        
            cloudinary.uploader.upload(req.file.path, function (result) {
                fs.unlink(req.file.path);
                if (!result.secure_url) { return res.json({message: 'cloudinary error in handleUpload'}); }
                
                var pin = new Pin();
                pin.url = result.secure_url;
                pin.owner = req.user.twitter.id;
                pin.name = req.user.twitter.name;
                pin.likes = 0;
                pin.likers = [];
                console.log('saving new pin with id: ' + pin._id);
                user.pins.push(pin._id);
                
                user.save(function (err) { 
                    if (err) { return res.json({message: 'User.save error in handleUpload'}); }
                    pin.save(function (err, pin) {
                        if (err) { return res.json({message: 'Pin.save error in handleUpload'}); }
                        res.json({message: 'Upload successful', pin: pin});
                    });
                });
            });
        });
    };
    
    
    this.getAllPins = function (req, res) {
        console.log('getAllPins');
        Pin.find({}, function (err, docs) {
            if (err) { return res.json({message: 'Pin.find error in getAllPins'}); }
            res.json({pins: docs});
        });
    };
    
    
    this.getPins = function (req, res) {
        console.log('getPins');
        if (req.query.user) {
            console.log('get pins for user ' + req.query.user);
            User.findOne({'twitter.id': req.query.user}, function (err, user) {
                if (err) { return res.json({message: 'User.findOne error in getPins'}); }
                if (!user) { return res.json({message: 'User not found in getPins'}); }
                Pin.find({
                    _id: { 
                        $in: user.pins.map(function (id) { return mongoose.Types.ObjectId(id); }) }
                    }, function (err, pins) {
                        if (err) { return res.json({message: 'Pin.find error in getPins'}); }
                        if (!pins) { return res.json({message: 'Pins not found in getPins'}); }
                        return res.json({pins});
                });
            });
        }
    };
    
    
    this.likePin = function (req, res) {
        console.log('Request to like pin: ' + req.body.id);
        Pin.findById(req.body.id, function (err, pin) {
            if (err) { return res.json({message: 'Pin.findById error in likePin'}); }
            if (!pin) { return res.json({message: 'Pin not found in likePin'}); }
            
            for (var i = 0; i < pin.likers.length; i++) {
                if (req.user.twitter.id === pin.likers[i]) {
                    return res.json({message: 'User already liked pin'});
                }
            }
            pin.likers.push(req.user.twitter.id);
            pin.likes++;
            pin.save(function (err) {
                if (err) { return res.json({message: 'Pin.save error in likePin'}); }
                res.json({message: 'Successful pin like'});
            })
        });
    };
    
    
    this.unlikePin = function (req, res) {
        console.log('Request to unlike pin: ' + req.body.id);
        Pin.findById(req.body.id, function (err, pin) {
            if (err) { return res.json({message: 'Pin.findById error in unlikePin'}); }
            if (!pin) { return res.json({message: 'Pin not found in unlikePin'}); }
            
            var ind = -1;
            for (var i = 0; i < pin.likers.length; i++) {
                if (req.user.twitter.id === pin.likers[i]) { ind = i; break; }
            }
            if (ind < 0) { return res.json({message: 'Cannot unlike; user has not liked pin'}); }
            pin.likers.splice(ind, 1);
            pin.likes--;
            pin.save(function (err) {
                if (err) { return res.json({message: 'Pin.save error in unlikePin'}); }
                return res.json({message: 'Successful pin unlike'});
            });
        });
    };
    
    
    this.deletePin = function (req, res) {
        if (req.query.id) {
            console.log('Request to delete pin: ' + req.query.id);
            User.findOne({'twitter.id': req.user.twitter.id}, function (err, user) {
                if (err) { return res.json({message: 'User.findOne error in deletePin'}); }
                if (!user) { return res.json({message: 'User not found in deletePin'}); }
                
                var ind = user.pins.indexOf(req.query.id);
                if (ind < 0) { return res.json({message: 'Pin not found in user\'s pin list'}); }
                
                Pin.findById(req.query.id, function (err, pin) {
                    if (err) { return res.json({message: 'Pin.findById error in deletePin'}); }
                    if (!pin) { return res.json({message: 'Pin not found in deletePin'}); }
                    
                    user.pins.splice(ind, 1);
                    user.save(function (err) {
                        if (err) { return res.json({message: 'User.save error in unlikePin'}); }
                        pin.remove(function (err) {
                            if (err) { return res.json({messsage: 'Pin.remove error in unlikePin'}) }
                            res.json({message: 'Pin successfuly deleted', op: 'delete'});
                        });
                    });
                });
            });
        } else { res.json({ message: 'No pin id' }); }
    };
    
}


module.exports = DbHandler;