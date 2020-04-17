const mongoose = require('../Database/mongoose')

const flowSchema = new mongoose.Schema({
	time: { type : Date, default: Date.now },
	status: String,
	number: Number,
	owners: [{type: mongoose.Schema.Types.ObjectId}] // you can decide its name or wether to use it (it's just one Attribute-based Access Control condition)
})

flowSchema.statics.create = async function(userId) { // create data (if owner like fields exist)
	const flow = new Flow()
	flow.owners.push(userId)
	await flow.save()
	return flow
}

flowSchema.methods.view = function() { // !! NOTICE: view is usually not async, if is async, you have to change the relative ones
	return {
		_id: this._id,
		time: this.time,
		status: this.status,
		number: this.number
	}
}

const Flow = mongoose.model('Flow', flowSchema)

module.exports = Flow