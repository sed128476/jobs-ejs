
const express = require('express');

require('express-async-errors');
const   rateLimiter = require('express-rate-limit');
const  helmet = require('helmet');
const  hpp = require('hpp');
const  xss = require('./middleware/security/xss.js');
console.log(xss);

const  mongoSanitize =  require('./middleware/security/mongoSanitize.js');

const  session = require('express-session');
const  connectMongoSession = require('connect-mongodb-session');
const  passport = require('passport');
const  passportSetup = require('./security/passportSetup.js');
const  flash = require('connect-flash');
const  setLocals       =require('./middleware/session/storeLocals.js');
const  cookieParser    =require('cookie-parser');
const  csrf            =require('host-csrf');

const  wordRouter      =require('./routes/secretWord.js');
const  sessionsRouter  =require('./routes/sessions.js');
const  jobsRouter      =require('./routes/jobs.js');

const  authMiddleware  =require('./middleware/session/auth.js');
const  notFound        =require('./middleware/notFound.js');
const  errorHandlerMiddleware =require('./middleware/errorHandler.js');

const  connectDatabase        =require('./db/connect.js');

const app = express();

app.set('view engine', 'ejs');
app.use(
	rateLimiter({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100 // max requests, per IP, per amount of time above
	}),
	express.urlencoded({ extended: true }),
	helmet(),
	hpp(),
	xss(),
	mongoSanitize()
);

if (app.get('env') === 'development') {
	process.loadEnvFile('./.env');
}

const MongoDBStore = connectMongoSession(session);
const store = new MongoDBStore({
	uri: process.env.MONGO_URI,
	collection: 'mySessions'
});
store.on('error', console.error);

const sessionParams = {
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: true,
	store,
	cookie: {
		sameSite: true
	}
};
const csrfOptions = {
	protected_operations: ['POST'],
	protected_content_types: [
		'application/json',
		'application/x-www-form-urlencoded'
	],
	development_mode: true
};
if (app.get('env') === 'production') {
	app.set('trust proxy', 1);
	sessionParams.cookie.secure = true;
	csrfOptions.development_mode = false;
}

app.use(session(sessionParams));
passportSetup();
app.use(passport.initialize(), passport.session());
app.use(flash(), setLocals);

app.use(cookieParser(process.env.COOKIE_KEY));
const csrfMiddleware = csrf(csrfOptions);

app.get('/', (req, res) => {
	res.render('index');
});
app.use('/sessions', sessionsRouter);
app.use('/secretWord', csrfMiddleware, authMiddleware, wordRouter);
app.use('/jobs', csrfMiddleware, authMiddleware, jobsRouter);

app.use(notFound, errorHandlerMiddleware);

const port = process.env.PORT || 3000;
const start = async () => {
	try {
		await connectDatabase(process.env.MONGO_URI);
		app.listen(port, err => {
			if (err) {
				console.error(`Could not start server on port ${port}.`);
				throw err;
			}
			console.log(`Server listening on port ${port}.`);
			console.log(`Access at: http://localhost:${port}`);
		});
	} catch (error) {
		console.error(error);
	}
};
start();