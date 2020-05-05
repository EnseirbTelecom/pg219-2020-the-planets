const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const bcrypt = require('bcrypt');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use((req,res,next) => {
  res.append("Access-Control-Allow-Origin", "*");
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const secretKey = 'secretKey';
const saltRounds = 10;

const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const urlMongo = "mongodb://localhost:27017/FriendFinder";

MongoClient.connect(urlMongo, {poolSize: 10})
           .then(clients => clients.db("FriendFinder"))
           .then(resultat =>{

             app.get("/users",verifyToken,(req,res) =>{
               jwt.verify(req.token,secretKey,(err,auth) =>{
                 if (err) {
                   res.status(401).json(err);
                 }else{
                   resultat.collection("users").find().toArray()
                            .then(items => res.status(201).json(items))
                 }
               });
             });

             app.post("/users",(req,res,next) =>{
               resultat.collection("users").findOne({"mail": req.body.mail},(err,user) =>{
                 if(user){
                   console.log("Compte deja existant");
                   return res.status(401).json({ error: "Compte deja existant" });
                 }else{
                   next();
                 }
               });
             },(req,res) => {
               const user = {
                 name: req.body.name,
                 surname: req.body.surname,
                 pseudo: req.body.pseudo,
                 birthday: req.body.birthday,
                 mail: req.body.mail,
                 password: req.body.password
               };
               resultat.collection("users").insertOne(user , (err,user) => {
                 if(user){
                   const forToken = {
                     mail: req.body.mail,
                     name: req.body.name,
                     surname: req.body.surname
                   }
                   jwt.sign(forToken,secretKey,{expiresIn: '1h'},(err,token) => {
                     console.log(token);
                     res.status(201).json({token: token});
                   });
                 }
               });
             });

             app.post("/connection",(req,res) =>{
               resultat.collection("users").findOne({"mail": req.body.mail,"password": req.body.password},(err,user) =>{
                 if(user){
                   res.status(201).json(user);
                 }
                 else{
                   res.status(403).json({erro: err})
                 }
               });
             });

             app.delete("/users",(req,res) =>{
               resultat.collection("users").deleteMany()
                        .then(items => res.json(items));
             });


             // Fonction pour Verifier le token
             // Format authorization: Basic <token>

             function verifyToken(req,res,next) {
               const tokenHearder = req.headers['authorization'];
               if(tokenHearder !== undefined){
                 const splitTokenHeader = tokenHearder.split(' ');
                 req.token = splitTokenHeader[1];
                 console.log(req.token);
                 next();
               }else{
                 res.sendStatus(403);
               }
             }

             app.listen(3000, () => console.log("Awaiting requests."));
           })
           .catch(err => { throw err });
