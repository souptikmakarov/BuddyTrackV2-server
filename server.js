var express=require('express');
var app = express();
var http = require('http').Server(app);
// var mongodb = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');
var sha256 = require('js-sha256');
var bodyParser = require('body-parser');
var fs = require('fs');

app.use(express.json());

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

// Connection URL. This is where your mongodb server is running.
// var url="mongodb://"+process.env.OPENSHIFT_MONGODB_DB_USERNAME+":"+process.env.OPENSHIFT_MONGODB_DB_PASSWORD+"@"+process.env.OPENSHIFT_MONGODB_DB_HOST+":"+process.env.OPENSHIFT_MONGODB_DB_PORT;
// var url="mongodb://127.0.0.1:27017/buddytrack";
// mongodb+srv://makarov:xdfnJm2cvlAZUERb@cluster0.dygtr.mongodb.net/
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
				err: null
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
			err: null
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
					err: null
				});
			}
			else{
				res.status(200).send({
					status: "error",
					message: "incorrect_password",
					err: null
				});
			}
		}
		else{
			res.status(200).send({
				status: "error",
				message: "incorrect_username",
				err: null
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
				message: "Username already exists",
				err: null
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
					err: null
				});
			}
			catch (err) {
				console.log(err);
				res.status(500).send({
					status: "error",
					message: "Error inserting record",
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

app.use(express.static("public"));

// app.get('/', function (req, res) {
//    console.log(req.query);
//    res.setHeader('Content-Type', 'text/html');
//    res.send(fs.readFileSync('index.html'));
// });

// app.get('/signin', function (req, res) {
//    res.setHeader('Content-Type', 'text/html');
//    res.send(fs.readFileSync('login.html'));
// });

// app.get('/signup', function (req, res) {
//    res.setHeader('Content-Type', 'text/html');
//    res.send(fs.readFileSync('register.html'));
// });

// app.get('/chat', function (req, res) {
//    res.setHeader('Content-Type', 'text/html');
//    res.send(fs.readFileSync('chat.html'));
// });

// app.get('/group', function (req, res) {
//    res.setHeader('Content-Type', 'text/html');
//    res.send(fs.readFileSync('group.html'));
// });

// app.get('/groupchat', function (req, res) {
//    res.setHeader('Content-Type', 'text/html');
//    res.send(fs.readFileSync('grpchat.html'));
// });

// app.get('/clear', function (req, res) {
//    res.setHeader('Content-Type', 'text/html');
//    res.send(fs.readFileSync('clear.html'));
// });

// app.get('/group', function (req, res) {
//    res.setHeader('Content-Type', 'text/html');
//    res.send(fs.readFileSync('group.html'));
// });

// app.get('/css/chat.css', function (req, res) {
//    res.setHeader('Content-Type', 'text/css');
//    res.send(fs.readFileSync('css/chat.css'));
// });

// app.get('/css/group.css', function (req, res) {
//    res.setHeader('Content-Type', 'text/css');
//    res.send(fs.readFileSync('css/group.css'));
// });

// app.get('/css/grpchat.css', function (req, res) {
//    res.setHeader('Content-Type', 'text/css');
//    res.send(fs.readFileSync('css/grpchat.css'));
// });

// app.get('/css/style.css', function (req, res) {
//    res.setHeader('Content-Type', 'text/css');
//    res.send(fs.readFileSync('css/style.css'));
// });

// app.get('/css/fontello.css', function (req, res) {
//    res.setHeader('Content-Type', 'text/css');
//    res.send(fs.readFileSync('css/fontello.css'));
// });

// app.get('/css/bootstrap.min.css', function (req, res) {
//    res.setHeader('Content-Type', 'text/css');
//    res.send(fs.readFileSync('css/bootstrap.min.css'));
// });

// app.get('/js/bootstrap.min.js', function (req, res) {
//    res.setHeader('Content-Type', 'text/javascript');
//    res.send(fs.readFileSync('js/bootstrap.min.js'));
// });

// app.get('/js/client.js', function (req, res) {
//    res.setHeader('Content-Type', 'text/javascript');
//    res.send(fs.readFileSync('js/client.js'));
// });

// app.get('/js/login.js', function (req, res) {
//    res.setHeader('Content-Type', 'text/javascript');
//    res.send(fs.readFileSync('js/login.js'));
// });

// app.get('/js/register.js', function (req, res) {
//    res.setHeader('Content-Type', 'text/javascript');
//    res.send(fs.readFileSync('js/register.js'));
// });

// app.get('/js/navbar.js', function (req, res) {
//    res.setHeader('Content-Type', 'text/javascript');
//    res.send(fs.readFileSync('js/navbar.js'));
// });

// app.get('/js/chat.js', function (req, res) {
//    res.setHeader('Content-Type', 'text/javascript');
//    res.send(fs.readFileSync('js/chat.js'));
// });

// app.get('/js/grpchat.js', function (req, res) {
//    res.setHeader('Content-Type', 'text/javascript');
//    res.send(fs.readFileSync('js/grpchat.js'));
// });

// app.get('/js/group.js', function (req, res) {
//    res.setHeader('Content-Type', 'text/javascript');
//    res.send(fs.readFileSync('js/group.js'));
// });

// app.get('/img/back.jpg', function (req, res) {
//    res.setHeader('Content-Type', 'image/jpg');
//    res.send(fs.readFileSync('img/back.jpg'));
// });

// app.get('/img/load.gif', function (req, res) {
//    res.setHeader('Content-Type', 'image/gif');
//    res.send(fs.readFileSync('img/load.gif'));
// });

// app.get('/img/menu.png', function (req, res) {
//    res.setHeader('Content-Type', 'image/png');
//    res.send(fs.readFileSync('img/menu.png'));
// });

// app.get('/img/menu2.png', function (req, res) {
//    res.setHeader('Content-Type', 'image/png');
//    res.send(fs.readFileSync('img/menu2.png'));
// });
