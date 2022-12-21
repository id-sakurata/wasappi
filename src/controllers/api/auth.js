import userModel from '../../models/user.js';
import config from '../../configs/config.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import formValidation from '../../helper/formValidation.js';
import lang from "../../configs/lang.js";

const register = async (req, res) => {
	var validationResult = await formValidation.validationRun(req, res, async function(body) {
		const {password} = req.body;
		await body("name").notEmpty().withMessage(lang.validationEmpty).run(req);
		await body("email").isEmail().withMessage(lang.validationEmail).custom(value => {
			return userModel.findOne({
				where: {
					email: value
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
					username: value
				}
			}).then((result)=>{
				if (result) {
					return Promise.reject(lang.validationUsernameTaken)
				}
			})
		}).run(req);
		await body("group").notEmpty().withMessage(lang.validationEmpty).run(req);
		await body("password").notEmpty().withMessage(lang.validationEmpty).run(req);
		await body("password_confirm").notEmpty().withMessage(lang.validationEmpty).equals(password).withMessage(lang.validationConfirmPassword).run(req);
	});
	if (!validationResult) {
		bcrypt.hash(req.body.password, config.bcryptRoundSalt).then(function(hash){
			req.body.password = hash;
			userModel.create(req.body).then(function(msg){
				res.json({
					"msg": "created."
				});
			}).catch(function(err){
				res.status(500).json({
					"msg": err
				});
			});
		});
	} else {
		res.status(422).json({
			"msg": lang.formFail,
			"errors": validationResult
		});
	}
}

const login = async (req, res) => {
	let user = await userModel.findOne({
		where: {
			"username": req.body.username
		}
	});

	if(user) {

		let confirm = await bcrypt.compare(req.body.password, user.password);
		if(confirm) {
			let token = jwt.sign({
				id: user.id,
				username: user.username
			}, config.jwtPrivateKey, {
				expiresIn: "12h"
			});
			res.json(token);
		} else {
			res.status(400).json({
				"msg": "password not match."
			});
		}

	} else {
		res.status(400).json({
			"msg": "user not found."
		});
	}

}

const setfirebasetoken = async (req, res) => {
	req.firebase_clients.set(req.userdata.id ,req.body.token ?? "");
	res.json({
		"msg": "firebase token updated."
	});
}

export default {
	register,
	login,
	setfirebasetoken
}