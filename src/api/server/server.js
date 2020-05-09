const express = require("express")
const app = express()
const jwt = require('jsonwebtoken');

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

const secretKey = 'secretKey';

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID
const url = 'mongodb+srv://test:toto@cluster0-zz5dr.mongodb.net/test?retryWrites=true&w=majority';


// ==================================
// ======      FONCTIONS      =======
// ==================================

// vérifie le token
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

// vérifie que tous les paramètres sont ok
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

// vérifie qu'une requête d'amitié n'existe pas déjà
const requestChecker = (friends, req, res, next) => {

	database.collection("friends").findOne({$or : [{mailSender: req.body.mailSender, mailReceiver: req.body.mailReceiver},{mailSender: req.body.mailReceiver, mailReceiver: req.body.mailSender}]}, { _id: 1, mailSender:1, mailReceiver:1, acceptation:1})
		.then(item => (item) ? res.json(item) : res.status(404).json({ error: "Entity not found." }))
		.catch(err => console.log("err" + err))
	console.log(friends);
	if (database._id){
		return res.status(400).json({ error: "request already exist" })
	}
	next()
}

// ===================================
// ======      CONNECTION      =======
// ===================================

MongoClient.connect(url, {
	useUnifiedTopology: true,
	useNewUrlParser: true,
	})

	.then((client) =>
		client.db("FriendFinder"),
	)
	.then((database) => {

		// ======================
		// ===   home (dev)   ===
		// ======================

		app.get("/friends/:id", (req, res) => {
			database.collection("friends").findOne({ _id: ObjectID(req.params.id) })
				.then(item => (item) ? res.json(item) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("err" + err))
		})

		app.put("/friends/:id", friendChecker, (req, res) => {
			const friend = {
				mailSender: req.body.mailSender,
				mailReceiver: req.body.mailReceiver,
				acceptation: req.body.acceptation
			}
			database.collection("friends").update({ _id: ObjectID(req.params.id) }, { $set: friend })
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

			database.collection("friends").updateOne({ _id: ObjectID(req.params.id) }, { $set: friend })
				.then(command => (command.result.n == 1) ? res.json(req.body) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("Error: " + err))
		})

		app.delete("/friends/:id", (req, res) => {
			database.collection("friends").deleteOne({ _id: ObjectID(req.params.id) })
				.then(command => (command.result.n == 1) ? res.json(req.params.id) : res.status(404).json({ error: "Entity not found." }))
		})

		app.post("/friends", friendChecker, (req, res) => {
			const friend = {
				mailSender: req.body.mailSender,
				mailReceiver: req.body.mailReceiver,
				acceptation: req.body.acceptation
			}
			database.collection("friends").insertOne(friend)
				.then(command => res.status(201).json(friend))
		})

		app.get("/friends", (req, res) => {
			database.collection("friends").find().toArray()
				.then(items => res.json(items))
		})

		// ======================
		// ===   homeFriend   ===
		// ======================

		// récupérer les noms liés aux mails
		app.get("/friendName/:mail", (req, res) => {
			database.collection("users").find({ mail: req.params.mail }, { _id: 1, firstName:1, lastName:1, mail:1}).toArray()
				.then(items => res.json(items))
		})
		
		// récupérer la liste des demandes faites par quelqu'un
		app.get("/reqFriendSender/:mail", (req, res) => {
			database.collection("friends").find({$and: [{mailSender: req.params.mail}, {acceptation: "0"} ]}, { _id: 1, mailSender:0, mailReceiver:1, acceptation:0}).toArray()
				.then(items => res.json(items))
		})
		// récupérer la liste des demandes faites à quelqu'un
		app.get("/reqFriendReceiver/:mail", (req, res) => {
			database.collection("friends").find({$and: [{mailReceiver: req.params.mail}, {acceptation: "0"} ]}, { _id: 1, mailSender:0, mailReceiver:0, acceptation:0}).toArray()
				.then(items => res.json(items))
		})

		// récupérer la liste des amis
		app.get("/reqFriends/:mail", (req, res) => {
			database.collection("friends").find({ $or: [ {mailReceiver: req.params.mail, acceptation: "1"}, {mailSender: req.params.mail, acceptation: "1"} ]}, { _id: 1, mailSender:0, mailReceiver:0, acceptation:0}).toArray()
				.then(items => res.json(items))
		})
		
		// =========================
		// ===   friendRequest   ===
		// =========================
		
		// récupérer les infos de la demande d'amitié à partir des mails de deux personnes
		app.get("/friendRequest/:mailSender/:mailReceiver", (req, res) => {
			database.collection("friends").findOne({$and : [{mailSender: req.params.mailSender}, {mailReceiver: req.params.mailReceiver}]}, { _id: 1, mailSender:1, mailReceiver:1, acceptation:1})
				.then(item => (item) ? res.json(item) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("err" + err))
		})

		// supprimer une demande d'ami ou une amitié
		app.delete("/friendRequest/:id", (req, res) => {
			database.collection("friends").deleteOne({ _id: ObjectID(req.params.id) })
				.then(command => (command.result.n == 1) ? res.json(req.params.id) : res.status(404).json({ error: "Entity not found." }))
		})

		// faire une nouvelle demande d'ami
		app.post("/friendRequest", friendChecker, (req, res) => {
			const friend = {
				mailSender: req.body.mailSender,
				mailReceiver: req.body.mailReceiver,
				acceptation: req.body.acceptation
			}
			database.collection("friends").insertOne(friend)
				.then(command => res.status(201).json(friend))
		})

		// répondre à une demande d'ami
		app.put("/friendRequest/:id", friendChecker, (req, res) => {
			const friend = {
				mailSender: req.body.mailSender,
				mailReceiver: req.body.mailReceiver,
				acceptation: req.body.acceptation
			}
			database.collection("friends").updateOne({ _id: ObjectID(req.params.id) }, { $set: friend })
				.then(command => (command.result.n == 1) ? res.json(req.body) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("Error " + err))
		})

		// récupérer les infos de l'amitié à partir des mails des deux personnes
		app.get("/friend/:mailSender/:mailReceiver", (req, res) => {
			database.collection("friends").findOne({$or : [{mailSender: req.params.mailSender, mailReceiver: req.params.mailReceiver},{mailSender: req.params.mailReceiver, mailReceiver: req.params.mailSender}]}, { _id: 1, mailSender:1, mailReceiver:1, acceptation:1})
				.then(item => (item) ? res.json(item) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("err" + err))
		})

		// =======================
		// ===   Inscription   ===
		// =======================

		// route pour test la présence d'un token dans la phase de test
		app.get("/users",verifyToken,(req,res) =>{
			jwt.verify(req.token,secretKey,(err,auth) =>{
			  if (err) {
				res.status(401).json(err);
			  }else{
				database.collection("users").find().toArray()
						 .then(items => res.status(201).json(items))
			  }
			});
		  });

		// route pour vérifier si il n'existe pas déjà un compte avec le même Mail
		// et soit d'ajouter le compte/l'utilisateur ou bien renvoier une erreur
		app.post("/users",(req,res,next) =>{
			database.collection("users").findOne({"mail": req.body.mail},(err,user) =>{
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
			database.collection("users").insertOne(user , (err,user) => {
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

		// route pour réaliser la connection et donc vérifier si le mail et le mot envoyé correspondent
		// bien à un utilsateur
		app.post("/connection",(req,res) =>{
			database.collection("users").findOne({"mail": req.body.mail,"password": req.body.password},(err,user) =>{
			  if(user){
				res.status(201).json(user);
			  }
			  else{
				res.status(403).json({erro: err})
			  }
			});
		  });

		  // route pour vider la BD pour la phase de test
		  app.delete("/users",(req,res) =>{
			database.collection("users").deleteMany()
				.then(items => res.json(items));
		  });


		// ==================================
		// ===   Serveur en mode écoute   ===
		// ==================================

		app.listen(3000, () => console.log("Awaiting requests."))
  })

	.catch(err => { throw err })

