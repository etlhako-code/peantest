require("dotenv").config({ path: __dirname + "/.env" });// brings environment valiables 
const http = require("http"); //used to create server
const app = require("./app"); //import app
const { logger } = require("./utils/logger"); // gives us more info on our routes results and errors

const server = http.createServer(app);

const PORT = process.env.PORT || 8080;

server.listen(PORT,'0.0.0.0', () => logger.info(`Magic happening on port: ${PORT}`));
