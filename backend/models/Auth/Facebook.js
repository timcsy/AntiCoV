const mongoose = require('../Database/mongoose')
const Identity = require('./Identity')

const facebookSchema = new mongoose.Schema({
	id: String,
	name: String,
	email: String,
	picture: String,
	accessToken: String
})

facebookSchema.methods.view = function() {
	return {
		_id: this._id,
		id: this.id,
		user: this.user,
		type: this.type,
		name: this.name,
		email: this.email,
		picture: this.picture
	}
}

const Facebook = Identity.discriminator('facebook', facebookSchema)

module.exports = Facebook