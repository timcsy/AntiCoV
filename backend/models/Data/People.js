const mongoose = require('../Database/mongoose')

const peopleSchema = new mongoose.Schema({
	studentId: String, // 學號
	rfid: Number,
	name: String,
	owners: [{type: mongoose.Schema.Types.ObjectId}] // you can decide its name or wether to use it (it's just one Attribute-based Access Control condition)
})

peopleSchema.statics.create = async function(userId) { // create data (if owner like fields exist)
	const people = new People()
	people.owners.push(userId)
	await people.save()
	return people
}

peopleSchema.methods.view = function() { // !! NOTICE: view is usually not async, if is async, you have to change the relative ones
	return {
		_id: this._id,
		studentId: this.studentId,
		rfid: this.rfid,
		name: this.name
	}
}

const People = mongoose.model('People', peopleSchema)

module.exports = People