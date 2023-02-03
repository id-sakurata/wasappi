import devicesModel from '../../models/devices.js'
import { Op } from "sequelize";
import formValidation from '../../helper/formValidation.js';
import lang from "../../configs/lang.js";
import bcrypt from 'bcrypt';
import config from '../../configs/config.js';
import {v1 as uniqId} from "uuid";
import jwt from "jsonwebtoken";
import axios from "axios";

const create = async (req, res) => {
	var validationResult = await formValidation.validationRun(req, res, async function(body) {
		const {password} = req.body;
		await body("name").notEmpty().withMessage(lang.validationEmpty).run(req);
	});

	if (!validationResult) {
		const jwtDecoded = jwt.verify(req.cookies.session, config.jwtPrivateKey);
		const form = {
			name: req.body.name,
			session: uniqId(),
			user_id: jwtDecoded.id
		};

		devicesModel.create(form).then(function(msg){
			res.json({
				"msg": "created."
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

const update = async (req, res) => {
	var validationResult = await formValidation.validationRun(req, res, async function(body) {
		const {password} = req.body;
		await body("name").notEmpty().withMessage(lang.validationEmpty).run(req);
	});

	if (!validationResult) {
		const jwtDecoded = jwt.verify(req.cookies.session, config.jwtPrivateKey);
		const form = {
			name: req.body.name,
		};

		devicesModel.update(form,{
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
	devicesModel.destroy({
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
		order: [ ['id', 'DESC'] ],
	};

	if( req.body.search.value ?? false ) {
		var search = {
			where: {
				[Op.or]: [
					{id: {[Op.like]: `%${req.body.search.value}%`}},
					{name: {[Op.like]: `%${req.body.search.value}%`}},
					{session: {[Op.like]: `%${req.body.search.value}%`}},
				],
			}
		}

		params = {...params, ...search};
	}

	var recordsTotal = await devicesModel.count();
	var recordsFilter = await devicesModel.count(params);
	var data = await devicesModel.findAll(params);

	await data.forEach(async (v, k)=>{
		try {
			const client = req.wa_clients.get(v.session);
			console.log(client);
			var state = await client.getState();
			data[k]['status'] = "Running";
		} catch(e) {
			data[k]['status'] = "Not Running";
		}
	});

	res.json({
		"draw": draw,
		"recordsTotal": recordsTotal,
		"recordsFiltered": recordsFilter,
		"data": data,
	})
}

const run = async (req, res) => {
	try {

		if(!req.wa_clients.has(req.params.id)) {
			const session_id = req.params.id;
			const client = new req.wa_webjs.Client({
				restartOnAuthFail: true,
		        puppeteer: { 
		        	headless: false, 
		        	userDataDir: `./sessions/${req.params.id}`,
		        	defaultViewport: null, 
		        	args: [
		            	'--no-sandbox','--disable-setuid-sandbox'
		        	] 
		    	}
			});

			axios.defaults.headers.post['Content-Type'] = `application/json`;
			axios.defaults.headers.post['Authorization'] = `key=AAAAXlmdJP4:APA91bHc8iskAf7p1IwGuK-mbsxoatyxt2Uao8dv14Qt2-XfRe9FSrKqaDWV4JnbJR8suxUikoWoy7QTSi8P1FyDgq_0R_rwBdM7sUI0Ix2qYmcPlZRj6nebM-zRk013NnOed9qc55AG`;

			req.wa_clients.set(req.params.id, client);

			client.on('qr', (qr) => {
			    if(req.userdata.fcmtoken ?? false) {
				    axios.post('https://fcm.googleapis.com/fcm/send', {
					    "to": req.userdata.fcmtoken,
					    "notification": {
					        "title":"QR Received.",
					        "body":"Device has qr code."
					    },
					    "data":{
					        "title":"QR Received.",
					        "body":"Device has qr code.",
					        "actions": "qr",
					        "qr": qr,
					    },
					    "priority":"high",
					    "webpush": {
					      "fcm_options": {
					        "link": "https://vue-app.com/devices"
					      }
					    }
					}).then(function(response){
				    	// console.log(response);
				    }).catch(function(error){
				    	// console.log(error);
				    });
			    }
			});

			client.on('ready', () => {
			    console.log(`[${session_id}] Client is ready!`);
			});

			client.on('message', msg => {
			    console.log(`[${session_id}] Has new msg`);
			    console.log(msg);
			});

			client.on('authenticated', ()=>{
			    console.log(`[${session_id}] Was authenticated`);
			});

			client.on('auth_failure', (msg)=>{
			    console.log(`[${session_id}] auth failure: `, msg);
			});

			client.on('disconnected', (reason)=>{
			    console.log(`[${session_id}] disconnected reason: `, reason);
			});

			client.initialize();
			
			res.json({
				"msg": "Device initialized."
			})
		} else {
			var client = req.wa_clients.get(req.params.id);
			try {
				var state = await client.getState();
				if(typeof state == "string") {
					if(state != "CONNECTED") {
						client.initialize();
					} else {
						res.status(400).json({
							"msg": "This device already run.",
							"state": state
						})
					}
				} else {
					try {
						client.destroy();
					} catch(err) {

					}

					client.initialize();
					res.json({
						"msg": "Device restarted.",
					});
				}
			} catch(err) {
				client.initialize();
				res.json({
					"msg": "Device started."
				})
			}
		}
	} catch(e) {
		res.status(500).json({
			"msg": "Fail intialize device.",
		})
	}
}

const restart = async(req, res) => {
	try {
		if(req.wa_clients.has(req.params.id)) {
			const client = req.wa_clients.get(req.params.id);
			
			try {
				client.destroy();
			} catch(err) {

			}

			client.initialize();
			res.json({
				"msg": "Device restarted.",
			});
		} else {
			res.status(500).json({
				"msg": "No device found.",
			})
		}
	} catch(e) {
		res.status(500).json({
			"msg": "Fail restart device.",
		})
	}
}

const status = async(req, res) => {
	try {
		const client = req.wa_clients.get(req.params.id);
		var state = await client.getState();
		res.json({
			"msg": "Get state.",
			"state": state
		});
	} catch(e) {
		res.status(500).json({
			"msg": "Fail get state device.",
		});
	}
}

const stop = async(req, res) => {
	try {
		const client = req.wa_clients.get(req.params.id);
		client.destroy();
		res.json({
			"msg": "Device stoped.",
		});
	} catch(e) {
		res.status(500).json({
			"msg": "Fail stop device.",
		});
	}
}

const send = async(req, res) => {
	try {
		const client = req.wa_clients.get(req.params.id);
		const {chatId, message} = req.body;
		client.sendMessage(`${chatId}@c.us`, message);
		res.json({
			"msg": "Message Send.",
		});
	} catch(e) {
		res.status(500).json({
			"msg": "Fail send message.",
		});
	}
}

export default {
	create, update,
	del, datatables,
	run, restart, 
	status, stop,
	send
}