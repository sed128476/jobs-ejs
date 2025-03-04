const CustomAPIError = require('./custom-api.js');

class NotFoundError extends CustomAPIError {
	constructor(message) {
		super(message);
		this.statusCode = 404;
	}
}

module.exports = {CustomAPIError, NotFoundError}