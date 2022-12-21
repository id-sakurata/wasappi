import renderview from '../helper/renderview.js';

const index = async (req, res) => {
	renderview.admin(req, res, 'home/index');
}

export default {
	index
}