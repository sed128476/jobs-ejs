import express from 'express';
import 'express-async-errors';
import rateLimiter from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import xss from './middleware/security/xss.js';
import mongoSanitize from './middleware/security/mongoSanitize.js';
import path from 'path';
import { fileURLToPath } from 'url'; // Import fileURLToPath

import session from 'express-session';
import connectMongoSession from 'connect-mongodb-session';
import passport from 'passport';
import passportSetup from './security/passportSetup.js';
import flash from 'connect-flash';
import setLocals from './middleware/session/storeLocals.js';
import cookieParser from 'cookie-parser';
import csrf from 'host-csrf';

import wordRouter from './routes/secretWord.js';
import sessionsRouter from './routes/sessions.js';
import jobsRouter from './routes/jobs.js';
import paymentsRouter from './routes/payments.js'; // Import the payments router

import authMiddleware from './middleware/session/auth.js';
import notFound from './middleware/notFound.js';
import errorHandlerMiddleware from './middleware/errorHandler.js';

import connectDatabase from './db/connect.js';

// Use fileURLToPath and path to get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');

// Set the directory for views and partials
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the views/partials directory
app.use(express.static(path.join(__dirname, 'views', 'partials')));

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
    saveUnitialized: true,
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
app.use('/payments', csrfMiddleware, authMiddleware, paymentsRouter); // Use the payments router

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
