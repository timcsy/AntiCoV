const readline = require('readline')
var Writable = require('stream').Writable;
const bcrypt = require('bcrypt')
const Local = require('./models/Auth/Local')
const User = require('./models/Auth/User')
const RBAC = require('./lib/rbac')
const rbacConfig = require('./config/rbac')

var mutableStdout = new Writable({
  write: function(chunk, encoding, callback) {
    if (!this.muted)
      process.stdout.write(chunk, encoding);
    callback();
  }
});

mutableStdout.muted = false;

var rl = readline.createInterface({
  input: process.stdin,
  output: mutableStdout,
  terminal: true
});

rl.question('admin password: ', async (password) => {
	console.log()
  let admin = await Local.findOne({username: 'admin'}).exec()
	if (!admin) {
		const hash = await bcrypt.hash(password, 12)
		admin = new Local({username: 'admin', password: hash})
		
		const user = await User.create()
		RBAC.addUserRoles(user._id, 'admin')
		admin.user = user

		await admin.save()
		console.log('Finish creating admin account')
	} else console.log('Admin account exists!')
	
	let guest = await Local.findOne({username: ''}).exec()
	if (!guest) {
		guest = new Local({username: ''})
		
		const user = await User.create()
		RBAC.addUserRoles(user._id, 'guest')
		guest.user = user

		await guest.save()
		console.log('Finish creating guest account')
	} else console.log('Guest account exists!')
	
	await RBAC.config(rbacConfig.roles)
	console.log('Finish creating RBAC roles')

	rl.close()
	process.exit()
})

mutableStdout.muted = true