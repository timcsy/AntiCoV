const mongoose = require('../Database/mongoose')

const subjectSchema = new mongoose.Schema({
	field: String,
	data: {type: mongoose.Schema.Types.ObjectId, ref: 'Data'}, // to demo foreign field
})

subjectSchema.methods.view = function() {
	return {
		_id: this._id,
		field: this.field,
		data: this.data
	}
}

const Subject = mongoose.model('Subject', subjectSchema)

module.exports = Subject