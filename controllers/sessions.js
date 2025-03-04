import User from '../models/User.js';
import parseVErr from '../utils/parseValidationErr.js';

export const registerShow = (req, res) => {
	res.render('register');
};

export const registerDo = async (req, res, next) => {
	if (req.body.password !== req.body.password1) {
		req.flash('error', 'The passwords entered do not match.');
		return res.render('register', { errors: req.flash('error') });
	}

	try {
		await User.create(req.body);
	} catch (e) {
		if (e.constructor.name === 'ValidationError') {
			parseVErr(e, req);
		} else if (e.name === 'MongoServerError' && e.code === 11000) {
			req.flash('error', 'That email address is already registered.');
		} else {
			return next(e);
		}
		return res.render('register', { errors: req.flash('error') });
	}
	res.redirect('/');
};

export const logoff = (req, res) => {
	req.session.destroy(function (err) {
		if (err) {
			console.log(err);
		}
		res.redirect('/');
	});
};

export const logonShow = (req, res) => {
	if (req.user) {
		return res.redirect('/');
	}
	res.render('logon');
};
