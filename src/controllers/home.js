const renderview = require('../helper/renderview.js');

const index = async (req, res) => {
	renderview.admin(req, res, 'home/index');
}

module.exports = {
	index
}