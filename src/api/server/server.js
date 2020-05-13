const express = require('express');
const app = express();

var schedule = require('node-schedule');



const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", "*");
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const urlMongo = "mongodb+srv://test:toto@cluster0-zz5dr.mongodb.net/test?retryWrites=true&w=majority";

MongoClient(urlMongo, { useUnifiedTopology: true }).connect()
  .then(client => client.db("mydb"))
  .then(database => {
    app.listen(3000, () => console.log("Awaiting requests."));

    var positions = database.collection("Positions");
    var friends = database.collection("Friends");
    var historique = database.collection("Historique");

    app.post('/postpos', (req, res) => {
      // positions.createIndex({ "expireAt": 1 }, { expireAfterSeconds: 0 });

      const user_position = {
        myid: ObjectID(req.body.myid),
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        comment: req.body.comment,
        createtime: new Date(),
        timeout: new Date(req.body.timeout)
      }


      positions.insertOne(user_position)
      res.status(200).json(user_position)

      var datepos = new Date(req.body.timeout)
      var datehisto = new Date(req.body.timeout)

      var ObjectId = require('mongodb').ObjectId;
      var myid = new ObjectId(user_position._id);

      var j = schedule.scheduleJob(datepos, function () {

        positions.find({ "_id": myid }, { $exists: true }).toArray(function (err, pos) {
          if (pos) {
            positions.deleteOne(user_position)
          }
        }
        )
      });




      var j = schedule.scheduleJob(datehisto, function () {

        historique.find({ "_id": myid }, { $exists: true }).toArray(function (err, histopos) {
          if (histopos) {
            historique.insertOne(user_position)
          }
        });
      });
    });


    app.delete('/deletecurrentpos', (req, res) => {

      positions.deleteOne({})
        .then(command => (command.result.n == 1) ? res.status(200).send() : res.status(404).json({ error: "Couldn't delete." }))

    });


    app.post('/posthistpos', (req, res) => {
      console.log(req);
      const user_last_position = {
        _id: ObjectID(req.body._id),
        myid: ObjectID(req.body.myid),
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        comment: req.body.comment,
        createtime: new Date(req.body.createtime),
        timeout: new Date()
      }

      historique.insertOne(user_last_position)
      res.status(200).json(user_last_position)

    })


    app.get("/mypos", (req, res) => {
      var ObjectId = require('mongodb').ObjectId;
      var myid = new ObjectId("5eb53d6bbd2f9326602accc2");
      positions.find({ "myid": myid }).toArray()
        .then(mypos => {
          res.status(200).json(mypos);
        })
        .catch(err => console.log("Error " + err))
    })



    app.get("/friendsname", (req, res) => {
      friends.find().toArray()
        .then(friendsinfos => {
          res.status(200).json(friendsinfos);
        })
        .catch(err => console.log("Error " + err))
    });

    app.get("/historique", (req, res) => {
      var ObjectId = require('mongodb').ObjectId;
      var myid = new ObjectId("5eb53d6bbd2f9326602accc2");
      historique.find({ "myid": myid }).sort({timeout: 1}).toArray()
        .then(mypos => {
          res.status(200).json(mypos);
        })
        .catch(err => console.log("Error " + err))
    })


    app.delete("/historique/:id", (req, res) => {
      historique.deleteOne({ _id: ObjectID(req.params.id) })
        .then(command => (command.result.n == 1) ? res.status(200).send() : res.status(404).json({ error: "Couldn't delete." }))
        .catch(err => console.log("Error " + err))
    })

  })
  .catch(err => { console.log(err) })


