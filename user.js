// user.js
function User(socket) {

	var UserModel = {username:String, login:String, password:String };

	this.socket = socket;
	this.charname = "NewUser";
	this.loginname = "LoginName"; 
}

User.prototype.changeName = function(newname) {

}

module.exports = User;
