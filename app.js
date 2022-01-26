const express = require("express");
require("express-async-errors");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const helmet = require("helmet"); 
const compression = require("compression");
const unknownEndpoint = require("./middleware/unKnownEndpoint");
const { handleError } = require("./helpers/error");
const pool = require('./config/index');
const app = express();

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(morgan("dev"));// logger
app.use(compression()); // compress req.body
app.use(helmet()); //security headers
app.use(cookieParser()); // allow use of cookies

app.use("/api/v1/", routes);

app.get("/", (req, res) =>{
  pool.query('select * from users',(err,result)=>{
       if(err) res.status(400).send({err,msg:"somthing went wrong"});

       res.status(200).send(result);
  });
  //res.status(200).send("E-COMMERCE API");
});
app.use(unknownEndpoint);
app.use(handleError);

module.exports = app;
