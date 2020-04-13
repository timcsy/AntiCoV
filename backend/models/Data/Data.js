const mongoose = require('../Database/mongoose')

const dataSchema = new mongoose.Schema({
	field: String, // to demo usual field
	arr: [String], // to demo array type
	obj: {type: mongoose.Schema.Types.ObjectId, ref: 'Data'}, // to demo reference
	refs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Subject'}], // to demo refernce array
	owners: [{type: mongoose.Schema.Types.ObjectId}] // you can decide its name or wether to use it (it's just one Attribute-based Access Control condition)
})

dataSchema.virtual('subjects', { // to demo virtual field
	ref: 'Subject',
	localField: '_id',
	foreignField: 'data'
})

dataSchema.statics.create = async function(userId) { // create data (if owner like fields exist)
	const data = new Data()
	data.owners.push(userId)
	await data.save()
	return data
}

dataSchema.methods.view = function() { // !! NOTICE: view is usually not async, if is async, you have to change the relative ones
	return {
		_id: this._id,
		field: this.field,
		arr: this.arr,
		obj: (this.obj && this.obj.view)? this.obj.view(): this.obj, // check if the view function is exist
		refs: (this.refs)? this.refs.map(r => (r.view)? r.view(): r): this.refs, // or you can check the specify fields and output it
		subjects: (this.subjects)? this.subjects.map(s => (s.view)? s.view(): s): this.subjects // if populated then show, otherwise is undefined
	}
}

const Data = mongoose.model('Data', dataSchema)

module.exports = Data