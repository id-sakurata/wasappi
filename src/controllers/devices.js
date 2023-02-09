const renderview = require('../helper/renderview.js');

const index = async (req, res) => {
	renderview.admin(req, res, 'devices/index');
}

module.exports = {
	index
}