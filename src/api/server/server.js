const express = require("express")
const app = express()

// Express middleware to parse requests' body
const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID
const url = 'mongodb://localhost:27017/FriendFinder';

const friendChecker = (req, res, next) => {
	const friend = {
		mailSender: req.body.mailSender,
		mailReceiver: req.body.mailReceiver,
		acceptation: req.body.acceptation
	}
	for (let attr in friend) {
		if (friend[attr] === undefined)
			return res.status(400).json({ error: "Bad friend parameters." })
	}
	next()
}

MongoClient.connect(url)
	.then((client) =>
		client.db("FriendFinder").collection("friends"),
	)
	.then((friends) => {
		app.get("/friends/:id", (req, res) => {
			friends.findOne({ _id: ObjectID(req.params.id) })
				.then(item => (item) ? res.json(item) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("err" + err))
		})

		app.put("/friends/:id", friendChecker, (req, res) => {
			const friend = {
				mailSender: req.body.mailSender,
				mailReceiver: req.body.mailReceiver,
				acceptation: req.body.acceptation
			}
			friends.update({ _id: ObjectID(req.params.id) }, { $set: friend })
				.then(command => (command.result.n == 1) ? res.json(req.body) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("Error " + err))
		})

		app.patch("/friends/:id", (req, res) => {
			const friend = {}
			if (req.body.mailSender)
				friend.mailSender = req.body.mailSender
			if (req.body.mailReceiver)
				friend.mailReceiver = req.body.mailReceiver
			if (req.body.acceptation)
				friend.acceptation = req.body.acceptation

			friends.update({ _id: ObjectID(req.params.id) }, { $set: friend })
				.then(command => (command.result.n == 1) ? res.json(req.body) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("Error: " + err))
		})

		app.delete("/friends/:id", (req, res) => {
			friends.remove({ _id: ObjectID(req.params.id) })
				.then(command => (command.result.n == 1) ? res.json(req.params.id) : res.status(404).json({ error: "Entity not found." }))
		})

		app.post("/friends", friendChecker, (req, res) => {
			const friend = {
				mailSender: req.body.mailSender,
				mailReceiver: req.body.mailReceiver,
				acceptation: req.body.acceptation
			}
			friends.insert(friend)
				.then(command => res.status(201).json(friend))
		})

		app.get("/friends", (req, res) => {
			friends.find().toArray()
				.then(items => res.json(items))
		})

		// recuperer les noms liés aux mails
		app.get("/friendName/:mail", (req, res) => {
			friends.find({ mailReceiver: req.params.mail }, { _id: 1, mailSender:0, mailReceiver:0, acceptation:0}).toArray()
				.then(items => res.json(items))
		})
		
		// recuperer la liste des demandes faites par quelqu'un
		app.get("/reqFriendSender/:mail", (req, res) => {
			friends.find({ mailSender: req.params.mail }, { _id: 1, mailSender:0, mailReceiver:0, acceptation:0}).toArray()
				.then(items => res.json(items))
		})
		// recuperer la liste des demandes faites à quelqu'un
		app.get("/reqFriendReceiver/:mail", (req, res) => {
			friends.find({ mailReceiver: req.params.mail }, { _id: 1, mailSender:0, mailReceiver:0, acceptation:0}).toArray()
				.then(items => res.json(items))
		})

		// recuperer la liste des amis
		app.get("/reqFriends/:mail", (req, res) => {
			friends.find({ $or: [ {mailReceiver: req.params.mail}, {mailSender: req.params.mail} ], $and: [{acceptation: "1"}]}, { _id: 1, mailSender:0, mailReceiver:0, acceptation:0}).toArray()
				.then(items => res.json(items))
		})

		app.listen(3000, () => console.log("Awaiting requests."))
  })

	.catch(err => { throw err })

