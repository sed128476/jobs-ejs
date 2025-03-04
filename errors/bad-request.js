const CustomAPIError = require('./custom-api.js');

class BadRequestError extends CustomAPIError {
	constructor(message) {
		super(message);
		this.statusCode = 400;
	}
}
module.exports = { CustomAPIError, BadRequestError}