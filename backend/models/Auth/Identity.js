const mongoose = require('../Database/mongoose')
const User = require('./User')
const RBAC = require('../../lib/rbac')

const options = {discriminatorKey: 'type'}

const identitySchema = new mongoose.Schema({
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, options)

identitySchema.methods.unlink = async function() {
	if ((await this.model('Identity').find({user: this.user}, {}).exec()).length > 1) {
		const user = await User.create()
		await RBAC.addUserRoles(user._id, 'member')
		this.user = user
		await this.save()
	}
}

identitySchema.methods.view = function() {
	return {
		_id: this._id,
		user: this.user
	}
}

const Identity = mongoose.model('Identity', identitySchema)

module.exports = Identity