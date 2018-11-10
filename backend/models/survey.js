var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Types = Schema.Types;
var SurveySchema = new Schema({
	title       : Types.String,
    questions   : [{
		title   : Types.String,
		options : [Types.String]
	}],
	created_by  : {
		type    : Types.ObjectId,
		ref     : 'User'
	},
	timestamp   : {
		type    : Types.Date,
		default : Types.Date.Now
	}
}, { collection: 'surveys' });
module.exports = mongoose.model('Survey', SurveySchema);