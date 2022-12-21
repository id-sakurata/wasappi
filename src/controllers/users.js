import renderview from '../helper/renderview.js';

const index = async (req, res) => {
	renderview.admin(req, res, 'users/index');
}

export default {
	index
}