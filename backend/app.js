var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');
var config = require('./config');

var auth = require('./middleware/auth')();
var userRouter = require('./routes/user');
var surveyRouter = require('./routes/survey');
var responseRouter = require('./routes/response');

mongoose.connect(config.mongo_connection_url, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.connection.on('error', function(err){
	console.error('MongoDB connection error: ' + err);
	process.exit(1);
});

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(auth.unless({
	path: [
		'/user/login',
		'/user/register'
	]
}));

app.use('/user', userRouter);
app.use('/survey', surveyRouter);
app.use('/response', responseRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  //err.message is error message
  res.status(err.status || 500);
  res.send();
});

module.exports = app;
