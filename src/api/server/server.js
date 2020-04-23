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
const urlMongo = "'mongodb://localhost:27017/FriendFinder";

MongoClient.connect(urlMongo)
           .then(clients => clients.db("FriendFinder"))
           .then(resultat =>{

             app.get("/users",(req,res) =>{
               resultat.collection("users").findOne({"mail": req.body.mail,"password": req.body.password})
                       .then(item => (item) ? res.json(item) : res.status(404).json({ error: "Entity not found." }))
                       .catch(err => console.log("err" + err));
             });

             app.post("/users",(req,res) =>{
               const product = {
                 name: req.body.name,
                 surname: req.body.surname,
                 mail: req.body.mail,
                 password: req.body.password
               };
               resultat.collection("users").insert(product)
                       .then(command => res.status(201).json(product));
             });


             app.listen(3000, () => console.log("Awaiting requests."));
           })
           .catch(err => { throw err });
