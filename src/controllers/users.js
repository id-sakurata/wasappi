const renderview = require('../helper/renderview.js');

const index = async (req, res) => {
	renderview.admin(req, res, 'users/index');
}

module.exports = {
	index
}