var jwt = require('jsonwebtoken');
var sha256 = require("sha256");
var randomstring = require("randomstring");
var User = require("../models/user");
var config = require('../config');

exports.login = function(req, res) {
	var missing = [];
	if(!req.body.username)
		missing.push("username");
	if(!req.body.password)
		missing.push("password");
	if(missing.length > 0){
		res.status(400).send("missing fields: " + missing.join(", "));
		return;
	}
	var incorrect = [];
	if(req.body.username.length === 0)
		incorrect.push("username");
	if(req.body.password.length === 0)
		incorrect.push("password");
	if(incorrect.length > 0){
		res.status(400).send("incorrect fields: " + incorrect.join(", "));
		return;
	}
	User.findOne({ username : req.body.username }, function(err, user) {
		if(err){
			console.error("MongoDB error: " + err);
			res.status(500).send();
		}else{
			if(user){
				if(sha256(req.body.password + user.password_salt) === user.password_hash){
					var expiry = (req.body.remember_me && req.body.remember_me === "true") ? 3600 * 24 * 10 : 3600 * 16;
					var token = jwt.sign({ user_id: user._id }, config.jwt_secret, {
						expiresIn: expiry
					});
					res.send(token);
				}else{
					res.status(401).send("invalid credentials");
				}
			}else{
				res.status(401).send("invalid credentials");
			}
		}
	});
};

exports.register = function(req, res) {
	var missing = [];
	if(!req.body.username)
		missing.push("username");
	if(!req.body.password)
		missing.push("password");
	if(missing.length > 0){
		res.status(400).send("missing fields: " + missing.join(", "));
		return;
	}
	var incorrect = [];
	if(req.body.username.length === 0)
		incorrect.push("username");
	if(req.body.password.length === 0)
		incorrect.push("password");
	if(incorrect.length > 0){
		res.status(400).send("incorrect fields: " + incorrect.join(", "));
		return;
	}
	
	var username = req.body.username;
	var password = req.body.password;
	var salt = generateSalt();
	
	User.findOne({ username : username }, function(err, user) {
		if(err){
			console.error("MongoDB error: " + err);
			res.status(500).send();
		}else{
			if(user){
				res.status(400).send("username is taken");
			}else{
				User.create({
					'username': username,
					'password_hash': sha256(password + salt),
					'password_salt': salt
				}, function(err, newUser){
					if(err){
						console.error("mongo can not create user: " + err);
						res.status(500).send();
					}else{
						var token = jwt.sign({ user_id: newUser._id }, config.jwt_secret, {
							expiresIn: 3600 * 16
						});
						res.send(token);
					}
				});
			}
		}
	});
};

exports.changeUsername = function(req, res) {
	var userId = req.auth.user_id;
	var username = req.body.username;
	if(!username){
		res.status(400).send("missing field username");
		return;
	}
	if(username.length === 0){
		res.status(400).send("incorrect field username");
		return;
	}
	User.findById(userId, function(err, user){
		if(err){
			console.error("mongo can not find user by id: " + err);
			res.status(500).send();
		}else{
			if(user){
				if(user.username === username){
					res.status(400).send("old and new usernames are identical");
				}else{
					User.findOne({ username : req.body.username }, function(err, duplicateUser) {
						if(err){
							console.error("MongoDB error: " + err);
							res.status(500).send();
						}else{
							if(duplicateUser){
								res.status(400).send("username is taken");
							}else{
								user.username = username;
								user.save(function(err, newUser){
									if(err){
										console.error("mongo can not update username: " + err);
										res.status(500).send();
									}
									res.send();
								});
							}
						}
					});
				}
			}else{
				console.error("invalid auth user id");
				res.status(500).send();
			}
		}
	});
};

exports.changePassword = function(req, res) {
	var userId = req.auth.user_id;
	var password = req.body.password;
	if(!password){
		res.status(400).send("missing field password");
		return;
	}
	if(password.length === 0){
		res.status(400).send("incorrect field password");
		return;
	}
	User.findById(userId, function(err, user){
		if(err){
			console.error("mongo can not find user by id: " + err);
			res.status(500).send();
		}else{
			if(user){
				user.password_hash = sha256(password + user.password_salt);
				user.save(function(err, newUser){
					if(err){
						console.error("mongo can not update password_hash: " + err);
						res.status(500).send();
					}
					res.send();
				});
			}else{
				console.error("invalid auth user id");
				res.status(500).send();
			}
		}
	});
};

function generateSalt() {
	return randomstring.generate({
		length: 20,
		charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 !\"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
	});
}