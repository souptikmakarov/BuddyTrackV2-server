var express=require('express');
var app = express();
var http = require('http').Server(app);
// var mongodb = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');
var sha256 = require('js-sha256');
var bodyParser = require('body-parser');
var fs = require('fs');
var cors = require('cors');

app.use(express.json());
app.use(cors());

var port=Number(process.env.OPENSHIFT_NODEJS_PORT || 3000);
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

http.listen(port,server_ip_address, function(){
  console.log(`listening on ${server_ip_address}:${port}`);
});

// var MongoClient = mongodb.MongoClient;
var url="mongodb+srv://makarov:xdfnJm2cvlAZUERb@cluster0.dygtr.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	}
});


app.post('/clrdb', async (req, res) => {
	var pass = req.body.password;
	if(pass == "toor") {
	    try {
			await client.connect();
			console.log('Connection established');
			var collection = client.db("buddytrack").collection("users");
			const result = await collection.deleteMany({});
    		console.log("Deleted " + result.deletedCount + " documents");
			res.status(200).send({
				status: "success",
				message: "Deleted " + result.deletedCount + " documents",
				err: ""
			});
		}
		catch (err){
			console.error("Error connecting to MongoDB");
			console.error(err);
			res.status(500).send({
				status: "error",
				message: "Error connecting to MongoDB",
				err: err
			});
		}
		finally {
			await client.close();
		}
	}else{
		res.status(500).send({
			status: "error",
			message: "incorrect_password",
			err: ""
		});
	}
});

function randomString() {
	var length=10;
	var chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

app.post("/hello", (req, res) => {
	console.log("Hello");
	console.log(req.body)
	res.send("Hello");
})

app.post('/login', async (req, res) => {
	try {
		await client.connect();
		console.log('Connection established');
		var collection = client.db("buddytrack").collection("users");
		console.log(req.body);
		const query = {username: req.body.username};
		if ((await collection.countDocuments(query)) != 0) {
			const result = await collection.findOne(query);
			var salt=result.salt;
			var final=req.body.password+salt;
			var hash=sha256(final);
			const loginQuery = {username:req.body.username,password:hash}
			if ((await collection.countDocuments(loginQuery)) != 0) {
				
				res.status(200).send({
					status: "success",
					message: "login_success",
					err: ""
				});
			}
			else{
				res.status(200).send({
					status: "error",
					message: "incorrect_password",
					err: ""
				});
			}
		}
		else{
			res.status(200).send({
				status: "error",
				message: "incorrect_username",
				err: ""
			});			
		}

	}
	catch (err){
		console.error("Error connecting to MongoDB");
		console.error(err);
		res.status(500).send({
			status: "error",
			message: "Error connecting to MongoDB",
			err: err
		});
	}
	finally {
		await client.close();
	}
});

app.post('/register', async (req, res) => {
	// console.log(`Register user ${JSON.stringify(req.body)}`);
	try {
		await client.connect();
		console.log('Connection established');
		var collection = client.db("buddytrack").collection("users");
		const query = {username: req.body.username};
		if ((await collection.countDocuments(query)) != 0) {
			res.status(200).send({
				status: "error",
				message: "username_exists",
				err: ""
			});
		}
		else{
			var salt=randomString();
			var final=req.body.password+salt;
			var hash=sha256(final);

			try {
				const userRecord = {
					username: req.body.username,
					password: hash,
					salt: salt
				}
				await collection.insertOne(userRecord);
				res.status(200).send({
					status: "success",
					message: "registration_complete",
					err: ""
				});
			}
			catch (err) {
				console.log(err);
				res.status(500).send({
					status: "error",
					message: "error_inserting_record",
					err: err
				});
			}
			
		}

	}
	catch (err){
		console.error("Error connecting to MongoDB");
		console.error(err);
		res.status(500).send({
			status: "error",
			message: "Error connecting to MongoDB",
			err: err
		});
	}
	finally {
		await client.close();
	}
});

app.use(express.static("public",{index:false,extensions:['html']}));