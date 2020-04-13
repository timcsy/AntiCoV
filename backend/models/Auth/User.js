const mongoose = require('../Database/mongoose')

const userSchema = new mongoose.Schema({
	groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group'}],
	roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}],
	permissions: [String],
	action: {type: String, default: 'allow'},
	owners: [mongoose.Schema.Types.ObjectId]
})

userSchema.virtual('identities', {
	ref: 'Identity',
	localField: '_id',
	foreignField: 'user'
})

userSchema.statics.create = async function() { // create user
	const user = new User()
	await user.save()
	user.owners.push(user._id)
	const admin = await this.model('Identity').findOne({type: 'local', username: 'admin'}).exec()
	if (admin) user.owners.push(admin.user)
	await user.save()
	return user
}

userSchema.statics.guest = async function() {
	const guest = await this.model('Identity').findOne({username: '', type: 'local'}).exec()
	if (guest) return guest.user
}

userSchema.statics.link = async function(former, latter) { // link accounts
	const res = await this.model('Identity').updateMany({'user': latter}, {$set: {'user': former}}).exec()
	if (former != latter) await this.model('User').findByIdAndRemove(latter).exec()
	// ... more you want to deal with user combination
	return res
}

userSchema.methods.view = function() {
	return {
		_id: this._id,
		identities: (this.identities)? this.identities.map(i => i.view()): undefined,
		groups: this.groups.map(g => (g.view)? g.view('info'): g),
		roles: this.roles.map(r => (r.value)? r.value: r),
		permissions: this.permissions,
		action: this.action,
		owners: this.owners
	}
}

const User = mongoose.model('User', userSchema)

module.exports = User