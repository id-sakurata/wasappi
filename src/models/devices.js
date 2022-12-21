import db from '../configs/database.js';
import { DataTypes } from "sequelize";

export default db.define("devices", {
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
})