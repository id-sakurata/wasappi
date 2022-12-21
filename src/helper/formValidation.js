import { body, validationResult } from "express-validator";

const validationRun = async function (req, res, validation) {
	await validation(body);
	const validationResults = validationResult(req);
	if (validationResults.isEmpty()) {
		return false;
	} else {
	  	return validationResults.array();
	}
};

export default {
	validationRun
}