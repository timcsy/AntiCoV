const mongoose = require('../Database/mongoose')

const groupSchema = new mongoose.Schema({
	roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}],
	permissions: [String],
	action: {type: String, default: 'allow'},
	name: String
})

groupSchema.virtual('users', {
	ref: 'User',
	localField: '_id',
	foreignField: 'groups'
})

groupSchema.methods.view = function(scope) {
	if (scope === 'info') return {
		_id: this._id,
		name: this.name
	}
	else return {
		_id: this._id,
		users: (this.users)? this.users.map(u => u._id): undefined,
		roles: this.roles.map(r => (r.value)? r.value: r),
		permissions: this.permissions,
		action: this.action,
		name: this.name
	}
}

const Group = mongoose.model('Group', groupSchema)

module.exports = Group