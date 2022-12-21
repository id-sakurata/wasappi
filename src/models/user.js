import db from '../configs/database.js';
import { DataTypes } from "sequelize";

export default db.define("users", {
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
})