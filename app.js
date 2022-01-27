const express = require("express");
require("express-async-errors");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const helmet = require("helmet"); 
const compression = require("compression");
const unknownEndpoint = require("./middleware/unKnownEndpoint"); // error 404 not found
const { handleError } = require("./helpers/error");// throws errors
const pool = require('./config/index');
const app = express();//create a server

app.use(cors({ credentials: true, origin: true }));// cross origin sharing resourses 
app.use(express.json());// allows body to come as json
app.use(morgan("dev"));// logger
app.use(compression()); // compress req.body
app.use(helmet()); //security headers
app.use(cookieParser()); // allow use of cookies

app.use("/api/v1/", routes); // routes all request to come as json

app.get("/test", (req, res) =>{  //test route and db
  pool.query('select * from users',(err,result)=>{
       if(err) res.status(400).send({err,msg:"somthing went wrong"});

       res.status(200).send(result);
  });
  //res.status(200).send("E-COMMERCE API");
});
app.use(unknownEndpoint); // if route not found 404 error
app.use(handleError);

module.exports = app;   // export app
