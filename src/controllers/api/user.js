const userModel = require('../../models/user.js');
const { Op } = require("sequelize");
const formValidation = require('../../helper/formValidation.js');
const lang = require("../../configs/lang.js");
const bcrypt = require('bcrypt');
const config = require('../../configs/config.js');

const update = async (req, res) => {
	var validationResult = await formValidation.validationRun(req, res, async function(body) {
		const {password} = req.body;
		await body("name").notEmpty().withMessage(lang.validationEmpty).run(req);
		await body("email").isEmail().withMessage(lang.validationEmail).custom(value => {
			return userModel.findOne({
				where: {
					email: value,
					id: { [Op.not]: req.params.id }
				}
			}).then((result)=>{
				if(result) {
					return Promise.reject(lang.validationEmailTaken)
				}
			})
		}).run(req);
		await body("username").notEmpty().withMessage(lang.validationEmpty).custom(value => {
			return userModel.findOne({
				where: {
					username: value,
					id: { [Op.not]: req.params.id }
				}
			}).then((result)=>{
				if (result) {
					return Promise.reject(lang.validationUsernameTaken)
				}
			})
		}).run(req);
		await body("group").notEmpty().withMessage(lang.validationEmpty).run(req);
		await body("password_confirm").equals(password).withMessage(lang.validationConfirmPassword).run(req);
	});

	if (!validationResult) {
		const {password} = req.body;

		if(password=="") {
			delete req.body['password'];
		} else {
			req.body['password'] = await bcrypt.hash(req.body.password, config.bcryptRoundSalt);
		}

		userModel.update(req.body, {
			where: {
				id: req.params.id
			}
		}).then(function(msg){
			res.json({
				"msg": "updated."
			});
		}).catch(function(err){
			res.status(500).json({
				"msg": err
			});
		});
	} else {
		res.status(422).json({
			"msg": lang.formFail,
			"errors": validationResult
		});
	}
}

const del = (req, res) => {
	userModel.destroy({
		where: {
			id: req.params.id
		}
	}).then(function(msg){
		res.json({
			"msg": "deleted."
		});
	}).catch(function(err){
		res.status(500).json({
			"msg": err
		});
	})
}

const datatables = async (req, res) => {
	var draw = req.body.draw;
	var start = req.body.start;
	var length = req.body.length;
	var params = {
		offset: parseInt(start),
		limit: parseInt(length),
		attributes: { exclude: ['password'] },
		order: [ ['id', 'DESC'] ],
	};

	if( req.body.search.value ?? false ) {
		var search = {
			where: {
				[Op.or]: [
					{name: {[Op.like]: `%${req.body.search.value}%`}},
					{username: {[Op.like]: `%${req.body.search.value}%`}},
					{email: {[Op.like]: `%${req.body.search.value}%`}},
					{group: {[Op.like]: `%${req.body.search.value}%`}},
				],
			}
		}

		params = {...params, ...search};
	}

	var recordsTotal = await userModel.count();
	var recordsFilter = await userModel.count(params);
	var data = await userModel.findAll(params);
	res.json({
		"draw": draw,
		"recordsTotal": recordsTotal,
		"recordsFiltered": recordsFilter,
		"data": data,
	})
}

module.exports = {
	update, del, datatables
}