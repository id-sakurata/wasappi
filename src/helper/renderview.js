const hbs = require("hbs");

const admin = async (req, res, path, data={}) => {
	let defaultdata = {
		userdata: req.userdata,
		layout: 'partials/template',
	}
	let viewdata = {...defaultdata, ...data};
	
	res.render(path, viewdata);
}

module.exports = {
	admin
}