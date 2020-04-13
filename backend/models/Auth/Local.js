const mongoose = require('../Database/mongoose')
const Identity = require('./Identity')

const localSchema = new mongoose.Schema({
	username: {type: String, unique: true},
	password: String
})

localSchema.methods.view = function() {
	return {
		_id: this._id,
		user: this.user,
		type: this.type,
		username: this.username
	}
}

const Local = Identity.discriminator('local', localSchema)

module.exports = Local