const  { clean } = require('../../security/xss');
console.log(clean);


// https://github.com/jsonmaur/xss-clean/blob/master/src/index.js
/**
 * export middleware
 * @return {function} Middleware function
 */
function xss() {
	return (req, res, next) => {
		if (req.body) req.body = clean(req.body);
		if (req.query) req.query = clean(req.query);
		if (req.params) req.params = clean(req.params);

		next();
	};
}

module.exports = xss;