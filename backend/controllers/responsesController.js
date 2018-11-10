var mongoose = require('mongoose');
var Response = require('../models/response');
var Survey = require('../models/survey');

exports.get = function(req, res) {
	var userId = req.auth.user_id;
	if(mongoose.Types.ObjectId.isValid(req.params.id)){
		Response.findById(req.params.id).populate('survey made_by').exec(function(err, response){
			if(!err){
				if(response){
					if(response.made_by._id.toString() === userId || response.survey.created_by.toString() === userId){
						res.setHeader('Content-Type', 'application/json');
						res.send(JSON.stringify(response));
					}else{
						res.status(403).send();
					}
				}else{
					res.status(400).send("invalid response id");
				}
			}else{
				console.error("mongo can not find responses: " + err);
				res.status(500).send();
			}
		});
	}else{
		res.status(400).send("bad id");
	}
};

exports.list = function(req, res) {
	var userId = req.auth.user_id;
	if(mongoose.Types.ObjectId.isValid(req.params.id)){
		Survey.findById(req.params.id, function(err, survey){
			if(!err){
				if(survey.created_by.toString() === userId){
					Response.find({ 'survey' : req.params.id }, '_id made_by').populate({ path: 'made_by', select: '_id username' }).sort('-timestamp').exec(function(err, responses){
						if(!err){
							if(!responses)
								responses = [];
							res.setHeader('Content-Type', 'application/json');
							res.send(JSON.stringify(responses));
						}else{
							console.error("mongo can not find responses: " + err);
							res.status(500).send();
						}
					});
				}else{
					res.status(403).send();
				}
			}else{
				console.error("mongo can not find surveys: " + err);
				res.status(500).send();
			}
		});
	}else{
		res.status(400).send("bad id");
	}
};

exports.create = function(req, res) {
	var userId = req.auth.user_id;
	if(mongoose.Types.ObjectId.isValid(req.params.id)){
		Response.findOne({ survey: req.params.id, made_by: userId }, function(err, response){
			if(!err){
				if(!response){
					// validate
					if(!(req.body.answers && req.body.answers.length > 0)){
						res.status(400).send("JSON field answers is missing or empty");
						return;
					}
					Survey.findById(req.params.id, function(err, survey){
						if(!err){
							var answers = req.body.answers;
							var ok = survey.questions.length === answers.length;
							if(!ok){
								res.status(400).send("incorrect answers field length");
								return;
							}
							for(var i = 0, sq = survey.questions, len = sq.len; i < len; ++i){
								var options = sq[i].options;
								var answer = answers[i];
								if(options.length > 0){
									if(options.indexOf(answer) === -1){
										res.status(400).send("invalid answer on question #" + (i + 1) + " in JSON field 'answers'");
										return;
									}
								}
							}
							// create
							Response.create({
								survey: survey._id,
								made_by: userId,
								contents: answers,
								timestamp: new Date()
							}, function(err, newResponse){
								if(!err){
									res.setHeader('Content-Type', 'application/json');
									res.send(JSON.stringify({ id: newResponse._id }));
								}else{
									console.error("mongo can not create response: " + err);
									res.status(500).send();
									return;
								}
							});
						}else{
							console.error("mongo can not find survey: " + err);
							res.status(500).send();
						}
					});
				}else{
					res.status(400).send("can not take survey more than once");
				}
			}else{
				console.error("mongo can not find response: " + err);
				res.status(500).send();
			}
		});
	}else{
		res.status(400).send("bad id");
	}
};