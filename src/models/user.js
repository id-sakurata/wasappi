const db = require('../configs/database.js');
const { DataTypes } = require("sequelize");

const users = db.define("users", {
	id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
	},
	group: {
		type: DataTypes.STRING
	},
	name: {
		type: DataTypes.STRING
	},
	username: {
		type: DataTypes.STRING
	},
	email: {
		type: DataTypes.STRING
	},
	password: {
		type: DataTypes.STRING
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

module.exports = users;