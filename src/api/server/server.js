const express = require("express")
const app = express()
const jwt = require('jsonwebtoken');
var schedule = require('node-schedule');

// Express middleware to parse requests' body
const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.append('Access-Control-Allow-Headers', 'Content-Type,authorization');
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
  jwt.verify(req.token,secretKey,(err,decode)=>{
    if (err) {
      res.status(401).json({err: err.message});
      return;
    }
    if (decode) {
      req.id = decode.id;
      next();
    }
  });
}else{
	res.status(403).json({err: "No token"});
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

		var positions = database.collection("Positions");
		var friends = database.collection("friends");
		var users = database.collection("users");
		var historique = database.collection("Historique");

		// =========================
		// ===   dev (friends)   ===
		// =========================

		app.get("/friends/:id",(req, res) => {
			friends.findOne({ _id: ObjectID(req.params.id) })
				.then(item => (item) ? res.json(item) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("err" + err))
		})

		app.put("/friends/:id",verifyToken, friendChecker, (req, res) => {
			const friend = {
				mailSender: req.body.mailSender,
				mailReceiver: req.body.mailReceiver,
				acceptation: req.body.acceptation
			}
			friends.updateOne({ _id: ObjectID(req.params.id) }, { $set: friend })
				.then(command => (command.result.n == 1) ? res.json(req.body) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("Error " + err))
		})

		app.patch("/friends/:id",verifyToken, (req, res) => {
			const friend = {}
			if (req.body.mailSender)
				friend.mailSender = req.body.mailSender
			if (req.body.mailReceiver)
				friend.mailReceiver = req.body.mailReceiver
			if (req.body.acceptation)
				friend.acceptation = req.body.acceptation

			friends.updateOne({ _id: ObjectID(req.params.id) }, { $set: friend })
				.then(command => (command.result.n == 1) ? res.json(req.body) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("Error: " + err))
		})

		app.delete("/friends/:id", verifyToken,(req, res) => {
			friends.deleteOne({ _id: ObjectID(req.params.id) })
				.then(command => (command.result.n == 1) ? res.json(req.params.id) : res.status(404).json({ error: "Entity not found." }))
		})

		app.post("/friends",verifyToken, friendChecker, (req, res) => {
			const friend = {
				mailSender: req.body.mailSender,
				mailReceiver: req.body.mailReceiver,
				acceptation: req.body.acceptation
			}
			friends.insertOne(friend)
				.then(command => res.status(201).json(friend))
		})

		app.get("/friends",(req, res) => {
			friends.find().toArray()
				.then(items => res.json(items))
		})

		// =======================
		// ===   dev (users)   ===
		// =======================

		app.get("/user/:id", (req, res) => {
			users.findOne({ _id: ObjectID(req.params.id) })
				.then(item => (item) ? res.json(item) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("err" + err))
		})

		app.put("/user/:id",verifyToken, (req, res) => {
			const user = {
				name: req.body.name,
                surname: req.body.surname,
                pseudo: req.body.pseudo,
                birthday: req.body.birthday,
                mail: req.body.mail,
                password: CryptoJS.MD5(req.body.password)
			}
			users.updateOne({ _id: ObjectID(req.params.id) }, { $set: friend })
				.then(command => (command.result.n == 1) ? res.json(req.body) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("Error " + err))
		})

		app.delete("/user/:id",verifyToken, (req, res) => {
			users.deleteOne({ _id: ObjectID(req.params.id) })
				.then(command => (command.result.n == 1) ? res.json(req.params.id) : res.status(404).json({ error: "Entity not found." }))
		})

		app.post("/user", (req, res) => {
			const user = {
				name: req.body.name,
                surname: req.body.surname,
                pseudo: req.body.pseudo,
                birthday: req.body.birthday,
                mail: req.body.mail,
                password: CryptoJS.MD5(req.body.password)
			}
			users.insertOne(user)
				.then(command => res.status(201).json(user))
		})

		app.get("/user", (req, res) => {
			users.find().toArray()
				.then(items => res.json(items))
		})

		// ======================
		// ===   homeRequest   ===
		// ======================

		// récupérer les noms liés aux mails
		app.get("/friendName/:mail", (req, res) => {
			users.find({ mail: req.params.mail }, { _id: 1, surname: 1, name: 1, mail: 1 }).toArray()
				.then(items => res.json(items))
		})

		// récupérer la liste des demandes faites par quelqu'un
		app.get("/reqFriendSender/:mail", (req, res) => {
			friends.find({ $and: [{ mailSender: req.params.mail }, { acceptation: "0" }] }, { _id: 1, mailSender: 0, mailReceiver: 1, acceptation: 0 }).toArray()
				.then(items => res.json(items))
		})
		// récupérer la liste des demandes faites à quelqu'un
		app.get("/reqFriendReceiver/:mail",(req, res) => {
			friends.find({ $and: [{ mailReceiver: req.params.mail }, { acceptation: "0" }] }, { _id: 1, mailSender: 0, mailReceiver: 0, acceptation: 0 }).toArray()
				.then(items => res.json(items))
		})

		// récupérer la liste des amis
		app.get("/reqFriends/:mail", (req, res) => {
			friends.find({ $or: [{ mailReceiver: req.params.mail, acceptation: "1" }, { mailSender: req.params.mail, acceptation: "1" }] }, { _id: 1, mailSender: 0, mailReceiver: 0, acceptation: 0 }).toArray()
				.then(items => res.json(items))
		})


		// =========================
		// ===   friendRequest   ===
		// =========================

		// récupérer les infos de la demande d'amitié à partir des mails de deux personnes
		app.get("/friendRequest/:mailSender/:mailReceiver", (req, res) => {
			friends.findOne({ $and: [{ mailSender: req.params.mailSender }, { mailReceiver: req.params.mailReceiver }] }, { _id: 1, mailSender: 1, mailReceiver: 1, acceptation: 1 })
				.then(item => (item) ? res.json(item) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("err" + err))
		})

		// supprimer une demande d'ami ou une amitié
		app.delete("/friendRequest/:id",verifyToken, (req, res) => {
			friends.deleteOne({ _id: ObjectID(req.params.id) })
				.then(command => (command.result.n == 1) ? res.json(req.params.id) : res.status(404).json({ error: "Entity not found." }))
		})

		// faire une nouvelle demande d'ami
		app.post("/friendRequest",verifyToken, friendChecker, requestChecker, userChecker, (req, res) => {
			const friend = {
				mailSender: req.body.mailSender,
				mailReceiver: req.body.mailReceiver,
				acceptation: req.body.acceptation
			}
			friends.insertOne(friend)
				.then(command => res.status(201).json(friend))
		})

		// vérifie qu'une requête d'amitié n'existe pas déjà
		function requestChecker(req,res,next) {
			friends.findOne(
				{$or : [{mailSender: req.body.mailSender, mailReceiver: req.body.mailReceiver},
				{mailSender: req.body.mailReceiver, mailReceiver: req.body.mailSender}]}
				,(err,friendRequest)=>{
			  if(friendRequest){
				console.log("Erreur : requête d'amitié similaire déjà existante");
				res.status(401).json({error: err});
			  }
			  else{
				next();
			  }
			})
		}
		// vérifie que l'utilisateur existe
		function userChecker(req,res,next) {
			users.findOne(
				{mail: req.body.mailReceiver}
				,(err,user)=>{
			  if(user){
				next();
			  }
			  else{
				console.log("Erreur : l'utilisateur n'existe pas dans le bdd");
				res.status(401).json({error: err});
			  }
			})
		}
		// répondre à une demande d'ami
		app.put("/friendRequest/:id",verifyToken, friendChecker, (req, res) => {
			const friend = {
				mailSender: req.body.mailSender,
				mailReceiver: req.body.mailReceiver,
				acceptation: req.body.acceptation
			}
			friends.updateOne({ _id: ObjectID(req.params.id) }, { $set: friend })
				.then(command => (command.result.n == 1) ? res.json(req.body) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("Error " + err))
		})

		// récupérer les infos de l'amitié à partir des mails des deux personnes
		app.get("/friend/:mailSender/:mailReceiver",(req, res) => {
			friends.findOne({ $or: [{ mailSender: req.params.mailSender, mailReceiver: req.params.mailReceiver }, { mailSender: req.params.mailReceiver, mailReceiver: req.params.mailSender }] }, { _id: 1, mailSender: 1, mailReceiver: 1, acceptation: 1 })
				.then(item => (item) ? res.json(item) : res.status(404).json({ error: "Entity not found." }))
				.catch(err => console.log("err" + err))
		})

		// =======================
		// ===   Inscription   ===
		// =======================

		// route pour test la présence d'un token dans la phase de test
		app.get("/users",(req,res) =>{
      users.find().toArray()
           .then(items => res.status(201).json(items))
		 });

		// route pour vérifier si il n'existe pas déjà un compte avec le même Mail
		// et soit d'ajouter le compte/l'utilisateur ou bien renvoier une erreur
		app.post("/registration",(req,res,next) =>{
			users.findOne({"mail": req.body.mail},(err,user) =>{
				if(user){
				console.log("Compte deja existant");
				return res.status(401).json({ error: "Account already used" });
				}else{
				next();
				}
			});
		}, (req, res) => {
			const user = {
				name: req.body.name,
				surname: req.body.surname,
				pseudo: req.body.pseudo,
				birthday: req.body.birthday,
				mail: req.body.mail,
				password: req.body.password
			};
			users.insertOne(user , (err,user) => {
				if(user){
				const forToken = {
          id: user.insertedId,
					mail: req.body.mail,
				}
        console.log(forToken);
				jwt.sign(forToken,secretKey,{expiresIn: 86400},(err,token) => { // 24h = 86400s
          if (token) {
            console.log(token);
            res.status(201).json({token: token});
          }
          else{
            res.status(401).json({err: err});
          }
				});
				}
			});
		});

		// route pour réaliser la connection et donc vérifier si le mail et le mot envoyé correspondent
		// bien à un utilsateur
		app.post("/connection",(req,res) =>{
      console.log(req.body.mail);
			users.findOne({"mail": req.body.mail,"password": req.body.password},(err,user) =>{
			  if(user){
          console.log(user);
          const forTokenConnexion = {
            id: user._id,
            mail: req.body.mail,
          };
          console.log(forTokenConnexion);
          jwt.sign(forTokenConnexion,secretKey,{expiresIn: 86400},(err,token) => { // 24h = 86400s
            if (token) {
              const response = {
                name: user.name,
                surname: user.surname,
                pseudo: user.pseudo,
                birthday: user.birthday,
                mail: user.mail,
                token: token,
              }
              console.log(response);
              res.status(201).json(response);
            }
            else{
              res.status(401).json({err: err});
            }
    			});
			  }
			  else{
				res.status(404).json({erro: err})
			  }
			});
		 });

		app.get("/testtoken",verifyToken,(req,res)=>{
		console.log("token correct");
			res.status(201).json("ok");
		});

		// route pour vider la BD pour la phase de test
		app.delete("/users", verifyToken,(req, res) => {
			users.deleteMany()
				.then(items => res.json(items));
		});

		// Balthazar

		app.post('/postpos', verifyToken,(req, res) => {
			// positions.createIndex({ "expireAt": 1 }, { expireAfterSeconds: 0 });

			const user_position = {
				mymail: req.body.mymail,
				pseudo: req.body.pseudo,
				latitude: req.body.latitude,
				longitude: req.body.longitude,
				comment: req.body.comment,
				createtime: req.body.createtime,
				timeout: new Date(req.body.timeout)
			}

      console.log(user_position);


			positions.insertOne(user_position)
			res.status(200).json(user_position)

			var datepos = new Date(req.body.timeout)
			var datehisto = new Date(req.body.timeout)

			var ObjectId = require('mongodb').ObjectId;
			var myid = new ObjectId(user_position._id);
			console.log(user_position._id);

			var j = schedule.scheduleJob(datepos, function () {

				positions.find({ "_id": myid }, { $exists: true }).toArray(function (err, pos) {
					if (pos) {
						positions.deleteOne(user_position)
					}
				})
			});

			console.log("task" + user_position._id);

			var j = schedule.scheduleJob("task" + user_position._id, datehisto, function () {

				historique.find({ "_id": myid }, { $exists: true }).toArray(function (err, histopos) {
					if (histopos) {
						historique.insertOne(user_position)
					}
				});
			});
		});


		app.delete('/deletecurrentpos/:id', verifyToken,(req, res) => {
			console.log(req.params.id)

			var my_job = schedule.scheduledJobs["task" + req.params.id];
			my_job.cancel();

			positions.deleteOne({ _id: ObjectID(req.params.id) })
				.then(command => (command.result.n == 1) ? res.status(200).send() : res.status(404).json({ error: "Couldn't delete." }))

		});


		app.post('/posthistpos', verifyToken,(req, res) => {
			console.log(req);
			const user_last_position = {
				_id: ObjectID(req.body._id),
				mymail: req.body.mymail,
				latitude: req.body.latitude,
				longitude: req.body.longitude,
				comment: req.body.comment,
				createtime: new Date(req.body.createtime),
				timeout: new Date()
			}

			historique.insertOne(user_last_position)
			res.status(200).json(user_last_position)

		});


		app.get("/mypos/:mymail", (req, res) => {

			positions.find({ "mymail": req.params.mymail }).toArray()
				.then(mypos => {
					res.status(200).json(mypos);
				})
				.catch(err => console.log("Error " + err))
		});



		app.get("/friendsname", (req, res) => {
			friends.find().toArray()
				.then(friendsinfos => {
					res.status(200).json(friendsinfos);
				})
				.catch(err => console.log("Error " + err))
		});

		app.get("/historique/:mymail", (req, res) => {
			// var ObjectId = require('mongodb').ObjectId;
			// var myid = new ObjectId("5eb53d6bbd2f9326602accc2");
			historique.find({ "mymail": req.params.mymail }).sort({ timeout: -1 }).toArray()
				.then(mypos => {
					res.status(200).json(mypos);
				})
				.catch(err => console.log("Error " + err))
		});


		app.delete("/historique/:id", (req, res) => {

			// var job = schedule.scheduledJobs;
			// console.log(job);
			// var my_job = schedule.scheduledJobs["task" + req.params.id];
			// my_job.cancel();



			historique.deleteOne({ _id: ObjectID(req.params.id) })
				.then(command => (command.result.n == 1) ? res.status(200).send() : res.status(404).json({ error: "Couldn't delete." }))
				.catch(err => console.log("Error " + err))


		});


		// ==================================
		// ===   Serveur en mode écoute   ===
		// ==================================

		app.listen(3000, () => console.log("Awaiting requests."))
	})

	.catch(err => { throw err })
