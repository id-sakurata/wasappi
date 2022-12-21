import { Sequelize } from "sequelize";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// const db = new Sequelize(
//   "mvc-admin",
//   "root",
//   "",
//   {
//     host: '127.0.0.1',
//     port: '3306',
//     dialect: 'mysql',
//     timezone: "+07:00",
//     logging: false
//   }
// );

const db = new Sequelize({
  dialect: 'sqlite',
  storage: './src/configs/database.db'
});

export default db;