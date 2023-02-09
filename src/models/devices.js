const db = require('../configs/database.js');
const { DataTypes } = require("sequelize");

const devices = db.define("devices", {
	id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
	},
	user_id: {
        type: DataTypes.INTEGER,
	},
	name: {
		type: DataTypes.STRING
	},
	session: {
		type: DataTypes.STRING
	},
	status: {
		type: DataTypes.STRING
	},
	startedAt: { 
		type: DataTypes.DATE
	},
	createdAt: { 
		type: DataTypes.DATE
	},
    updatedAt: { 
    	type: DataTypes.DATE
    },
    deletedAt: { 
    	type: DataTypes.DATE
    }
}, {
	paranoid: true
});

module.exports = devices;