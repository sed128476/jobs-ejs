const  CustomAPIError = require('./custom-api.js');

class UnauthenticatedError extends CustomAPIError {
	constructor(message) {
		super(message);
		this.statusCode = 401;
	}
}

module.exports = { UnauthenticatedError, CustomAPIError, };