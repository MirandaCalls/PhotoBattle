const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sqlite = require('sqlite');
const DbModelFactory = require('./models/services').DbModelFactory;
const ModelUser = require('./models/users').ModelUser;
const ModelTournament = require('./models/tournaments').ModelTournament;
const RouterCommon = require('./routes/common');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);

let app = express();

// load config data
app.config = require('./config');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set up session handling using an in-memory store
app.use(session({
	cookie: {maxAge: 86400000},
	// Note: Using an in memory store means sessions are lost when server restarts
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
	}),
	saveUninitialized: false,
	resave: false,
    secret: app.config.appSecret
}));

// Open connection to the database
// Requires sqlite file to already exist with valid schema
sqlite.open('app.db').then((db) => {
	let model_factory = new DbModelFactory(db);
	model_factory.register('ModelUser', ModelUser);
	model_factory.register('ModelTournament', ModelTournament);
	app.models = model_factory;
});

let router = require('./routes/main.router');
app.use('/', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	res.status(404);
	res.render('notfound', RouterCommon.buildBasePageData(req, 'Not Found'));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error', RouterCommon.buildBasePageData(req, 'Server Error'));
});

module.exports = app;
