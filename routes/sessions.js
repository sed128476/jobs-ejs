const express = require('express');
const csrf = require('host-csrf');
const passport = require('passport');
const router = express.Router();

const {
    logonShow,
    registerShow,
    registerDo,
    logoff
} = require('../controllers/sessions.js');

router
    .route('/register')
    .get(registerShow)
    .post((req, res, next) => {
        res.locals.csrf = csrf.token(req, res);
        next();
    }, registerDo);

router
    .route('/logon')
    .get(logonShow)
    .post(
        (req, res, next) => {
            if (res.locals.csrf) res.locals.csrf = csrf.refresh(req, res);
            else res.locals.csrf = csrf.token(req, res);

            next();
        },
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/sessions/logon',
            failureFlash: true
        })
    );

router.route('/logoff').post(logoff);

module.exports = router;
