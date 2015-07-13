// user.js
User.prototype.LOGINSTATE_NONE = 0;
User.prototype.LOGINSTATE_ASKUSER = 1;
User.prototype.LOGINSTATE_ASKPASS = 2;
User.prototype.LOGINSTATE_DONE = 3;

// constructor
function User(socket) {

	var UserModel = {username:String, login:String, password:String, loginstate:Number };




	this.socket = socket;
	this.charname = "UnknownChar";
	this.loginname = "UnknownUser"; 
	this.loginstate = User.prototype.LOGINSTATE_NONE;
}

// changes the character name - for testing.
User.prototype.changeName = function(newname) {
	this.charname = newname;
};

module.exports = User;
