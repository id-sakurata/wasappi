const devicesModel = require('../../models/devices.js');
const { Op } = require("sequelize");
const formValidation = require('../../helper/formValidation.js');
const lang = require("../../configs/lang.js");
const bcrypt = require('bcrypt');
const config = require('../../configs/config.js');
const {v1} = require("uuid");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const create = async (req, res) => {
	var validationResult = await formValidation.validationRun(req, res, async function(body) {
		const {password} = req.body;
		await body("name").notEmpty().withMessage(lang.validationEmpty).run(req);
	});

	if (!validationResult) {
		const jwtDecoded = jwt.verify(req.cookies.session, config.jwtPrivateKey);
		const form = {
			name: req.body.name,
			session: v1(),
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

	const vdata = data.map(function(val) {
		try {
			const client = req.wa_clients.get(val.session);
			if(client) {
				client.getState().then(function(result){
					val['status'] = result;
				});
			} else {
				val['status'] = "Not Initialized";
			}
		} catch(e) {
			val['status'] = "Not Initialized";
		}
		return val;
	});

	await res.json({
		"draw": draw,
		"recordsTotal": recordsTotal,
		"recordsFiltered": recordsFilter,
		"data": data,
	})
}

const device_err = async (e) => {
	if(req.userdata.fcmtoken ?? false) {
	    axios.post('https://fcm.googleapis.com/fcm/send', {
		    "to": req.userdata.fcmtoken,
		    "notification": {
		        "title":"Device Crashed.",
		        "body":"Device was crashed, please restart device."
		    },
		    "data":{
		        "title":"Device Crashed.",
		        "body":"Device was crashed, please restart device.",
		    },
		    "priority":"high",
		    "webpush": {
		      "fcm_options": {
		        "link": "http://gw.sakuratadevapp.my.id/devices"
		      }
		    }
		}).then(function(response){
	    	// console.log(response);
	    }).catch(function(error){
	    	// console.log(error);
	    });
    }
}

const run = async (req, res) => {
	try {

		if(!req.wa_clients.has(req.params.id)) {
			const session_id = req.params.id;
			const client = new req.wa_webjs.Client({
				restartOnAuthFail: true,
		        puppeteer: { 
		        	headless: true, 
		        	userDataDir: `./sessions/${req.params.id}`,
		        	defaultViewport: null, 
		        	args: [
		            	'--no-sandbox',
		            	'--disable-setuid-sandbox',
		            	'--disable-dev-shm-usage',
		            	'--disable-accelerated-2d-canvas',
						'--no-first-run',
						'--no-zygote',
						'--disable-gpu'
		        	] 
		    	}, 
		    	restartOnAuthFail: true,
		    	takeoverOnConflict: true,
		    	takeoverTimeoutMs: 10
			});

			axios.defaults.headers.post['Content-Type'] = `application/json`;
			axios.defaults.headers.post['Authorization'] = `key=AAAAXlmdJP4:APA91bHc8iskAf7p1IwGuK-mbsxoatyxt2Uao8dv14Qt2-XfRe9FSrKqaDWV4JnbJR8suxUikoWoy7QTSi8P1FyDgq_0R_rwBdM7sUI0Ix2qYmcPlZRj6nebM-zRk013NnOed9qc55AG`;

			req.wa_clients.set(req.params.id, client);

			client.on('qr', (qr) => {

				const form = {
					status: "stopped",
				};

				devicesModel.update(form,{
					where: {
						session: req.params.id
					}
				}).then(function(msg){
					console.log(`[${session_id}] Status Updated`);
				}).catch(function(err){
					console.log(`[${session_id}] `, err);
				});

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
					        "link": "http://gw.sakuratadevapp.my.id/devices"
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
			    if(req.userdata.fcmtoken ?? false) {
				    axios.post('https://fcm.googleapis.com/fcm/send', {
					    "to": req.userdata.fcmtoken,
					    "notification": {
					        "title":"Device Ready.",
					        "body":"Device Connected."
					    },
					    "data":{
					        "title":"Device Ready.",
					        "body":"Device Connected.",
					        "actions": "qr_connected",
					    },
					    "priority":"high",
					    "webpush": {
					      "fcm_options": {
					        "link": "http://gw.sakuratadevapp.my.id/devices"
					      }
					    }
					}).then(function(response){
				    	// console.log(response);
				    }).catch(function(error){
				    	// console.log(error);
				    });
			    }
			});

			client.on('message', msg => {
			    console.log(`[${session_id}] Has new msg`);
			});

			client.on('authenticated', ()=>{

				const form = {
					status: "running",
				};

				devicesModel.update(form,{
					where: {
						session: req.params.id
					}
				}).then(function(msg){
					console.log(`[${session_id}] Status Updated`);
				}).catch(function(err){
					console.log(`[${session_id}] `, err);
				});

			    console.log(`[${session_id}] Was authenticated`);
			});

			client.on('auth_failure', (msg)=>{
			    console.log(`[${session_id}] auth failure: `, msg);
			});

			client.on('disconnected', (reason)=>{

				const form = {
					status: "stopped",
				};

				devicesModel.update(form,{
					where: {
						session: req.params.id
					}
				}).then(function(msg){
					console.log(`[${session_id}] Status Updated`);
				}).catch(function(err){
					console.log(`[${session_id}] `, err);
				});

			    console.log(`[${session_id}] disconnected reason: `, reason);
			});

			client.initialize().catch(_ => _);
			
			res.json({
				"msg": "Device initialized."
			})
		} else {
			var client = req.wa_clients.get(req.params.id);
			try {
				var state = await client.getState();
				if(typeof state == "string") {
					if(state != "CONNECTED") {
						client.initialize().catch(_ => _);
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

					client.initialize().catch(_ => _);
					res.json({
						"msg": "Device restarted.",
					});
				}
			} catch(err) {
				client.initialize().catch(_ => _);
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

			client.initialize().catch(_ => _);
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

		const form = {
			status: "stopped",
		};

		devicesModel.update(form,{
			where: {
				session: req.params.id
			}
		}).then(function(msg){
			console.log(`[${req.params.id}] Status Updated`);
		}).catch(function(err){
			console.log(`[${req.params.id}] `, err);
		});

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

module.exports = {
	create, update,
	del, datatables,
	run, restart, 
	status, stop,
	send
}