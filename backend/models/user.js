var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Types = Schema.Types;
var UserSchema = new Schema({
	username      : Types.String,
    password_hash : Types.String,
	password_salt : Types.String
}, { collection: 'users' });
module.exports = mongoose.model('User', UserSchema);