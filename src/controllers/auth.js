import userModel from '../models/user.js' ;
import config from '../configs/config.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import lang from "../configs/lang.js";

const login = (req, res) => {
	res.render('login', {
		layout: false
	});
}

const loginAttempt = async (req, res) => {
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
			}, config.jwtPrivateKey);

			res.cookie("session", token, {
				httpOnly: true,
				secure: true
			});

			res.json({
				"msg": lang.loginSuccess
			});
		} else {
			res.status(400).json({
				"msg": lang.loginFail
			});
		}

	} else {
		res.status(400).json({
			"msg": lang.userNotFound
		});
	}
}

const logoutAttempt = async (req, res) => {
	res.clearCookie('session');
	res.redirect('/login');
}

export default {
	login,
	loginAttempt,
	logoutAttempt
}