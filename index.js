import express from "express";
import hbs from "hbs";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import config from "./src/configs/config.js";
import db from "./src/configs/database.js";
import routerWeb from "./src/routers/web.js";
import routerApi from "./src/routers/api.js";
import wa_webjs from "whatsapp-web.js";
import auth from "./src/middlewares/authentication.js";
import https from 'https'
import fs from 'fs'

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

// start server
// const httpsServer = https.createServer({
//   ca: fs.readFileSync('./ssl/cacert.pem'),
//   key: fs.readFileSync('./ssl/laragon.key'),
//   cert: fs.readFileSync('./ssl/laragon.crt'),
//   requestCert: false,
//   rejectUnauthorized: false,
// }, app);
// httpsServer.listen(443, () => console.log(`Server Running at https://localhost`))
app.listen(process.env.PORT ?? config.port, () => console.log(`Server Running at http://localhost:${config.port}`));

export default {app}