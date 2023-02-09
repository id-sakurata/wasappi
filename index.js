const express = require("express");
const hbs = require("hbs");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./src/configs/config.js");
const db = require("./src/configs/database.js");
const routerWeb = require("./src/routers/web.js");
const routerApi = require("./src/routers/api.js");
const wa_webjs = require("whatsapp-web.js");
const auth = require("./src/middlewares/authentication.js");
const https = require('https');
const fs = require('fs');


// const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();
var wa_clients = new Map();

//Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Cookie Parser
app.use(cookieParser());

// ignore route public dir
app.use(express.static('public'));
app.use(express.static('/favicon.ico'));

app.use(async (req, res, next)=>{
  req.wa_webjs = wa_webjs;
  req.wa_clients = wa_clients;
  next();
});

//set template engine
app.set('view engine', 'html');
app.set('views', './src/views');
app.engine('html', hbs.__express);
hbs.registerPartials('./src/views/partials');

//load routers
app.use("/", routerWeb);
app.use("/api", routerApi);

// Load Database
db.authenticate()
  .then(function(msg) {
     console.log("Connection established.");
  }).catch(function(err) {
  	throw new Error('Unable to connect to database')
  });

// // start server
// // const httpsServer = https.createServer({
// //   ca: fs.readFileSync('./ssl/cacert.pem'),
// //   key: fs.readFileSync('./ssl/laragon.key'),
// //   cert: fs.readFileSync('./ssl/laragon.crt'),
// //   requestCert: false,
// //   rejectUnauthorized: false,
// // }, app);
// // httpsServer.listen(443, () => console.log(`Server Running at https://localhost`))
app.listen(process.env.PORT ?? config.port, () => console.log(`Server Running at http://localhost:${config.port}`));

module.exports = app