var mongoose = require('mongoose');
var Survey = require('../models/survey');
var Response = require('../models/response');

var DEFAULT_ITEMS_PER_PAGE = 20;

exports.create = function(req, res) {
	var userId = req.auth.user_id;
	// validate input
	var ok = req.body.title && req.body.title.trim().length > 0;
	if(!ok){
		res.status(400).send("JSON field 'title' is missing or empty");
		return;
	}
	ok = req.body.questions && req.body.questions.length > 0;
	if(!ok){
		res.status(400).send("JSON field 'questions' is missing or empty");
		return;
	}
	var questions = req.body.questions;
	for(var i = 0, len = questions.length; i < len; ++i){
		var question = questions[i];
		ok = question.title && question.title.trim().length > 0;
		if(!ok){
			res.status(400).send("question #" + (i + 1) + " in JSON field 'questions' does not have a 'title' field or it is empty");
			return;
		}
		ok = question.options && question.options.length !== 1;
		if(!ok){
			res.status(400).send("question #" + (i + 1) + "in JSON field 'questions' does not have an 'options' field or it contains exactly one element");
			return;
		}
	}
	// create
	Survey.create({
		created_by: userId,
		title: req.body.title,
		questions: req.body.questions,
		timestamp: new Date()
	}, function(err, newSurvey){
		if(err){
			console.error("mongo can not create survey: " + err);
			res.status(500).send();
		}else{
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({ id: newSurvey._id }));
		}
	});
};

exports.get = function(req, res) {
	var userId = req.auth.user_id;
	if(mongoose.Types.ObjectId.isValid(req.params.id)){
		Survey.findById(req.params.id).populate({ path: 'created_by', select: '_id username' }).exec(function(err, survey){
			if(!err){
				if(survey){
					var result = {
						_id: survey._id,
						created_by: survey.created_by,
						timestamp: survey.timestamp,
						title: survey.title,
						questions: survey.questions
					};
					
					// set whether user has created this survey
					result.createdByUser = survey.created_by._id.toString() === userId;
					
					// set whether user has taken this survey
					Response.findOne({ made_by: userId, survey: survey._id }, function(err, response){
						if(!err){
							if(response){
								result.takenByUser = response._id;
							}else{
								result.takenByUser = false;
							}
							
							// if user is creator of survey, send response data for this survey
							if(result.createdByUser){
								Response.find({ survey: survey._id }, '_id').populate({ path: 'made_by', select: '_id username' }).exec(function(err, responses){
									if(!err){
										var resultResponses = []
										for(var i = 0, len = responses.length; i < len; ++i){
											var response = responses[i];
											resultResponses.push({
												_id: response._id,
												username: response.made_by.username
											});
										}
										result.responses = resultResponses;
										
										res.setHeader('Content-Type', 'application/json');
										res.send(JSON.stringify(result));
									}else{
										console.error("mongo can not find responses: " + err);
										res.status(500).send();
									}
								});
							}else{
								res.setHeader('Content-Type', 'application/json');
								res.send(JSON.stringify(result));
							}
						}else{
							console.error("mongo can not find response: " + err);
							res.status(500).send();
						}
					});
				}else{
					res.status(400).send("invalid survey id");
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

exports.list = function(req, res) {
	var userId = req.auth.user_id;
	
	// pagination
	var page = parseInt(req.query.page);
	if(!page || page <= 0)
		page = 1;
	var itemsPerPage = parseInt(req.query.itemsPerPage);
	if(!itemsPerPage || itemsPerPage <= 0)
		itemsPerPage = DEFAULT_ITEMS_PER_PAGE;
	var skipCount = (page - 1) * itemsPerPage;
	
	// filtering
	var filter = req.query.filter;
	if(filter === 'created'){
		// created by user
		Survey.find({ created_by: userId }, '_id title').sort('-timestamp').limit(itemsPerPage).skip(skipCount).exec(function(err, surveys){
			if(!err){
				Survey.countDocuments({ created_by: userId }, function(err, count){
					if(!err){
						res.setHeader('Content-Type', 'application/json');
						res.send(JSON.stringify({
							data: surveys,
							pagination: {
								page: page,
								itemsPerPage: itemsPerPage,
								totalItems: count
							}
						}));
					}else{
						console.error("mongo can not count surveys: " + err);
						res.status(500).send();
					}
				});
			}else{
				console.error("mongo can not find surveys: " + err);
				res.status(500).send();
			}
		});
	}else if(filter === 'taken'){
		// taken by user
		Response.find({ made_by: userId }, '_id survey').sort('-timestamp').populate({ path: 'survey', select: '_id title' }).limit(itemsPerPage).skip(skipCount).exec(function(err, responses){
			if(!err){
				var surveys = responses.map(function(el){
					return el.survey;
				});
				Response.countDocuments({ made_by: userId }, function(err, count){
					if(!err){
						res.setHeader('Content-Type', 'application/json');
						res.send(JSON.stringify({
							data: surveys,
							pagination: {
								page: page,
								itemsPerPage: itemsPerPage,
								totalItems: count
							}
						}));
					}else{
						console.error("mongo can not count responses: " + err);
						res.status(500).send();
					}
				});				
			}else{
				console.error("mongo can not find responses: " + err);
				res.status(500).send();
			}
		});
	}else{
		// all
		Survey.find({}, '_id title').sort('-timestamp').limit(itemsPerPage).skip(skipCount).exec(function(err, surveys){
			if(!err){
				Survey.countDocuments({}, function(err, count){
					if(!err){
						res.setHeader('Content-Type', 'application/json');
						res.send(JSON.stringify({
							data: surveys,
							pagination: {
								page: page,
								itemsPerPage: itemsPerPage,
								totalItems: count
							}
						}));
					}else{
						console.error("mongo can not count surveys: " + err);
						res.status(500).send();
					}
				});
			}else{
				console.error("mongo can not find surveys: " + err);
				res.status(500).send();
			}
		});
	}
};

exports.modify = function(req, res) {
	var userId = req.auth.user_id;
	if(mongoose.Types.ObjectId.isValid(req.params.id)){
		Survey.findById(req.params.id, function(err, survey){
			if(!err){
				// check whether user has privileges to modify
				if(survey.created_by.toString() != userId){
					res.status(403).send();
					return;
				}
				// check whether survey can be modified (if it does not have any associated responses)
				Response.findOne({ survey: req.params.id }, function(err, response){
					if(!err){
						if(!response){
							// validate input
							var ok = req.body.title && req.body.title.trim().length > 0;
							if(!ok){
								res.status(400).send("JSON field 'title' is missing or empty");
								return;
							}
							ok = req.body.questions && req.body.questions.length > 0;
							if(!ok){
								res.status(400).send("JSON field 'questions' is missing or empty");
								return;
							}
							var questions = req.body.questions;
							for(var i = 0, len = questions.length; i < len; ++i){
								var question = questions[i];
								ok = question.title && question.title.trim().length > 0;
								if(!ok){
									res.status(400).send("question #" + (i + 1) + " in JSON field 'questions' does not have a 'title' field or it is empty");
									return;
								}
								ok = question.options && question.options.length !== 1;
								if(!ok){
									res.status(400).send("question #" + (i + 1) + "in JSON field 'questions' does not have an 'options' field or it contains exactly one element");
									return;
								}
							}
							// update
							survey.title = req.body.title;
							survey.questions = req.body.questions;
							survey.timestamp = new Date();
							survey.save(function(err){
								if(!err){
									res.send();
								}else{
									console.error("mongo can not update survey: " + err);
									res.status(500).send();
								}
							});
						}else{
							res.status(400).send("surveys that have been taken can not be modified");
						}
					}else{
						console.error("mongo can not find response: " + err);
						res.status(500).send();
					}
				});
			}else{
				console.error("mongo can not find survey: " + err);
				res.status(500).send();
			}
		});
	}else{
		res.status(400).send("bad id");
	}
};

exports.delete = function(req, res) {
	var userId = req.auth.user_id;
	if(mongoose.Types.ObjectId.isValid(req.params.id)){
		Survey.findById(req.params.id, function(err, survey){
			if(!err){
				// check whether user has privileges to delete
				if(survey.created_by.toString() != userId){
					res.status(403).send();
					return;
				}
				// check whether survey can be deleted (if it does not have any associated responses)
				Response.findOne({ survey: req.params.id }, function(err, response){
					if(!err){
						if(!response){
							Survey.findByIdAndDelete(req.params.id, function(err){
								if(!err){
									res.send();
								}else{
									console.error("mongo can not delete survey: " + err);
									res.status(500).send();
								}
							});
						}else{
							res.status(400).send("surveys that have been taken can not be deleted");
						}
					}else{
						console.error("mongo can not find response: " + err);
						res.status(500).send();
					}
				});
			}else{
				console.error("mongo can not find survey: " + err);
				res.status(500).send();
			}
		});
	}else{
		res.status(400).send("bad id");
	}
};