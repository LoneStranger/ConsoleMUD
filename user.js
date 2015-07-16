// user.js
User.prototype.LOGINSTATE_NONE = 0;
User.prototype.LOGINSTATE_ASKUSER = 1;
User.prototype.LOGINSTATE_ASKPASS = 2;
User.prototype.LOGINSTATE_DONE = 3;

// constructor
function User(socket) {

	var UserModel = {charname:String, loginname:String, password:String, loginstate:Number };




	this.socket = socket;
	this.charname = "UnknownChar";
	this.loginname = "UnknownUser"; 
	this.loginstate = User.prototype.LOGINSTATE_NONE;
}

// changes the character name - for testing.
User.prototype.changeName = function(newname) {
	this.charname = newname;
};

User.prototype.loadData = function(userCollection, loginname) {
	console.log("Loading data for login: " + loginname);

	userCollection.find({user:loginname}, {limit:1});

};
module.exports = User;
