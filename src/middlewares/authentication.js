import userModel from '../models/user.js'
import config from '../configs/config.js'
import jwt from "jsonwebtoken";
import lang from "../configs/lang.js";
import axios from "axios";

const webAuthenticate = async (req, res, next) => {
	if(req.cookies.session ?? false) {
		try {
			let decoded = jwt.verify(req.cookies.session, config.jwtPrivateKey);
			let user = await userModel.findOne({
				where: {
					"id": decoded.id
				}
			});
			
			req.userdata = user;
			if(req.body.fcmtoken ?? false) {
				req.userdata['fcmtoken'] = req.body.fcmtoken;
			}

			next();
		} catch(err) {
			res.redirect('/login');
		}
	} else {
		res.redirect('/login');
	}
}

const getUserdata = async (req, res) => {
	if(req.cookies.session ?? false) {
		try {
			let jwtDecoded = jwt.verify(req.cookies.session, config.jwtPrivateKey);
			let user = await userModel.findOne({
				where: {
					"id": jwtDecoded.id
				}
			});
			return user
		} catch(err) {
			return lang.unauthorized
		}
	} else {
		return lang.unauthorized
	}
}

export default {
	webAuthenticate,
	getUserdata
}