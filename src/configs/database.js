const { Sequelize } = require("sequelize");
const path = require("path");

// const __dirname = path.dirname(new URL(import.meta.url).pathname);

const db = new Sequelize(
  "sakurata_wa", //database name
  "sakurata", // username
  "gjm456PTW789", // password
  {
    host: 'sakuratadevapp.my.id',
    port: '3306',
    dialect: 'mysql',
    timezone: "+07:00",
    logging: false
  }
);

module.exports = db;