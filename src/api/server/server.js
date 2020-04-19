const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use((req,res,next) => {
  res.append("Access-Control-Allow-Origin", "*");
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const urlMongo = "'mongodb://localhost:27017/";

MongoClient.connect(urlMongo){

  app.listen(3000, () => console.log("Awaiting requests."));
};
