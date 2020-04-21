const mongoose = require('../Database/mongoose')

const recordSchema = new mongoose.Schema({
	time: { type : Date, default: Date.now },
	people: {type: mongoose.Schema.Types.ObjectId, ref: 'People'},
	temperature: Number,
	owners: [{type: mongoose.Schema.Types.ObjectId}] // you can decide its name or wether to use it (it's just one Attribute-based Access Control condition)
})

recordSchema.statics.create = async function(userId) { // create data (if owner like fields exist)
	const record = new Record()
	record.owners.push(userId)
	await record.save()
	return record
}

recordSchema.methods.view = function() { // !! NOTICE: view is usually not async, if is async, you have to change the relative ones
	return {
		_id: this._id,
		time: this.time,
		people: (this.people && this.people.view)? this.people.view(): this.people, // check if the view function is exist
		temperature: this.temperature
	}
}

const Record = mongoose.model('Record', recordSchema)

module.exports = Record