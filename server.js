// ConsoleMUD
// Started 2015-07-12
// @LnStrngr (headley at lonestranger dot net)
//
// Initially based on code from:
// http://www.davidmclifton.com/2011/07/22/simple-telnet-server-in-node-js/
//
//

var net = require('net');
var rl = require('readline');
var querystring = require('querystring');
var mongoClient = require('mongodb').MongoClient;
var User = require('./user');

//var sockets = [];
var userList = [];
var listenSocket = 8888;
var newline = "\n\r";

var userCollection;

mongoClient.connect("mongodb://localhost:27017/MikeMUD", function(err, db) {
	if (!err) {
		console.log("Connected to MikeMUD DB");

		//userCollection = db.collection('userCollection', function(err, collection) {});



	}
	else
	{
		console.log("Cannot connect to MikeMUD DB!");
		process.exit(1);
	}
})


function receiveData(user, data) {

	//socket = user.socket;
	var cleanData = cleanInput(data).trim();

	// this checks for any backspaces and removes them, as well as the character before them.
	for (var i = 0; i < cleanData.length; i++) {
		if (cleanData[i] === '\b' && (i > 0))
		{	
			// as Joey from Full House says, "Cut it out!"
			cleanData = cleanData.slice(0,i-1) + cleanData.slice(i+1);
			i -= 2;
		}
	}

	console.log("cleanData[" + user.charname + "]: " + cleanData);

	// check to see if the user has logged in yet.
	if (user.loginstate === User.prototype.LOGINSTATE_NONE) 	{
		user.loginstate = User.prototype.LOGINSTATE_ASKUSER;
	}
	// Are we asking for the login name?
	if (user.loginstate === User.prototype.LOGINSTATE_ASKUSER) 	{

		if (cleanData === "user")
		{
			user.loginstate = User.prototype.LOGINSTATE_ASKPASS;
			sendDataThis(user, "login pass: ");
		} else {
			sendDataThis(user, "login name: ");
		}

	}
	// Are we asking for the login pass?
	else if (user.loginstate === User.prototype.LOGINSTATE_ASKPASS) {

		if (cleanData === "pass") {
			user.loginstate = User.prototype.LOGINSTATE_DONE;
			sendDataThis(user, "Entering world...." + newline);
			sendPrompt(user);
		} else {
			sendDataThis(user, "login pass: ");
		}

	}
	// if we get this far, then they should be logged in.
	else if (user.loginstate === User.prototype.LOGINSTATE_DONE) {

		

		if (cleanData === "@quit") {
			socket.end('Goodbye!' + newline);
			sendDataAllButThis(user, user.charname + " vanishes in a puff of smoke.");
		}
		else if (cleanData.substr(0,4).toLowerCase() === "help")
		{
			sendDataThis(user, help);
			sendPrompt(user);
		}
		else if (cleanData.substr(0,4).toLowerCase() === "say ")// || cleanData.toLowerCase().substr(0,1) === "'")
		{
			cleanData = cleanData.substr(4);
			sendDataAllButThis(user, "You hear " + user.charname + " say '" + cleanData + "'" + newline);
			sendDataThis(user,"You say '" + cleanData + "'" + newline);

			sendPrompt(user);
		}
		else if (cleanData.substr(0,5).toLowerCase() === "name ") {
			user.changeName(cleanData.substr(5));
		}
		else {
			//sendDataAllButThis(socket, data + newline);
			sendDataThis(user, "I don't understand." + newline);
			sendPrompt(user);
		}
	}
	// If we fall down to this part, then we are probably in trouble.
	else {
		console.log("Logging in user somehow in a bad state: " + user.loginstate);
	}



}

function sendPrompt(user)
{
	sendDataThis(user, "> ");
}

function sendDataAll(data)
{
	for (var i = 0; i < userList.length; i++) {
		userList[i].socket.write(data);
	}
}

function sendDataThis(user, data)
{
	if (user.socket != null) {
		user.socket.write(data);
	} else {
		console.log("Unable to write to socket: " + user.charname);
	}
}

function sendDataAllButThis(user, data)
{
	for (var i = 0; i < userList.length; i++) {
		if (userList[i] !== user) {
			userList[i].socket.write(data);
		}
	}	
}

function closeSocket(user)
{
	var u = userList.indexOf(user);
	//var i = sockets.indexOf(socket);
	if (u != -1) {
		userList.splice(u,1);
		//sockets.splice(i,1);
	}
}

function cleanInput(data)
{
	return data.toString().replace(/(\r\n|\n|\r)/gm,"");
}

function newSocket(socket)
{

	var thisUser = new User(socket);

	// only send the data message if the user has ended the line with 'enter.'
	var intrfce = rl.createInterface(thisUser.socket, thisUser.socket);
	intrfce.on('line', function (line)
	{
		receiveData(thisUser, line);
	})

	// save the socket into the array.
	//sockets.push(socket);
	userList.push(thisUser);
	thisUser.socket.write('Welcome to MikeMUD!' + newline);

	thisUser.socket.write('login name: ');

	//socket.on('data', function(data) {
	//	receiveData(socket, data);
	//})
	thisUser.socket.on('end', function () {
		closeSocket(thisUser);
	})


}

var help = 'These are the following commands that work.' + newline;
	help += newline;
	help += " - help              displays this command list." + newline;
	help += " - say [text]        says the text to everyone in the room." + newline;
	help += " - name [text]       changes your name" + newline;


var server = net.createServer(newSocket);

server.listen(listenSocket);