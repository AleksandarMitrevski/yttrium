var jwt = require("jsonwebtoken");
var config = require('../config');

module.exports = function () {
	var auth = function (req, res, next){
		var headerAuth = req.headers.authorization;
		if(headerAuth && headerAuth.toLowerCase().startsWith("bearer ")){
			var token = headerAuth.substring(7);
			jwt.verify(token, config.jwt_secret, function(err, data) {
				if(err){
					return res.status(401).send();
				}else{
					req.auth = {
						user_id: data.user_id
					};
					next();
				}
			});
		}else{
			return res.status(401).send();
		}		
	};
	auth.unless = require('express-unless');
	return auth;
};