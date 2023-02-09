const { body, validationResult } = require("express-validator");

const validationRun = async function (req, res, validation) {
	await validation(body);
	const validationResults = validationResult(req);
	if (validationResults.isEmpty()) {
		return false;
	} else {
	  	return validationResults.array();
	}
};

module.exports = {
	validationRun
}