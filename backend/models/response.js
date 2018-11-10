var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Types = Schema.Types;
var ResponseSchema = new Schema({
	survey      : {
		type    : Types.ObjectId,
		ref     : 'Survey'
	},
    contents    : [Types.String],
	made_by     : {
		type    : Types.ObjectId,
		ref     : 'User'
	},
	timestamp   : {
		type    : Types.Date,
		default : Types.Date.Now
	}
}, { collection: 'responses' });
module.exports = mongoose.model('Response', ResponseSchema);