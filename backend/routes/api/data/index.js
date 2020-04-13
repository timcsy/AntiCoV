const Router = require('koa-router')
const Data = require('../../../models/Data/Data')
const Subject = require('../../../models/Data/Subject')
const RBAC = require('../../../lib/rbac')

const router = new Router()

// list datas
router.get('/datas', RBAC.auth(true), RBAC.middleware('datas:list'), async (ctx) => {
	// can only view datas if you are the owner of the data
	const datas = await Data.find({}).select({owners: 1}).exec()
	const list = []
	for (let data of datas)
		if (await RBAC.check(ctx.state.user, 'datas:list', data.owners)) {
			data = await Data.findById(data._id).populate('obj').populate('refs').populate('subjects').exec()
			list.push(data.view())
		}
	ctx.body = list
})

// get data by id
router.get('/datas/:id', RBAC.auth(true), RBAC.middleware('datas:get'), async (ctx) => {
	// can only view the data if you are the owner of the data
	let data = await Data.findById(ctx.params.id).select({owners: 1}).exec()
	if (data) {
		if (await RBAC.check(ctx.state.user, 'datas:get', data.owners)) {
			data = await Data.findById(data._id).populate('obj').populate('refs').populate('subjects').exec()
			ctx.body = data.view()
		} else ctx.throw(401)
	} else ctx.throw(404)
})

// create data
router.post('/datas', RBAC.auth(true), RBAC.middleware('datas:post'), async (ctx) => {
	let data = await Data.create(ctx.state.user)
	data.field = ctx.request.body.field
	data.arr = ctx.request.body.arr
	data.obj = ctx.request.body.obj
	data.refs = ctx.request.body.refs
	await data.save()

	// some other operation about data
	const subject = new Subject()
	subject.field = 'Subject field'
	subject.data = data._id
	await subject.save()

	data = await Data.findById(data._id).populate('obj').populate('refs').populate('subjects').exec()
	ctx.body = data.view()
	ctx.status = 201
	ctx.set('Location', '/api/datas/' + data._id)
})

// update data by id
router.put('/datas/:id', RBAC.auth(true), RBAC.middleware('datas:put'), async (ctx) => {
	// can only update the data if you are the owner of the data
	let data = await Data.findById(ctx.params.id).select({owners: 1}).exec()
	if (data) {
		if (await RBAC.check(ctx.state.user, 'datas:put', data.owners)) {
			data = await Data.findById(data._id).exec()
			data.field = ctx.request.body.field
			data.arr = ctx.request.body.arr
			data.obj = ctx.request.body.obj
			data.refs = ctx.request.body.refs
			await data.save()

			// some other operation about data
			const subject = new Subject()
			subject.data = data._id
			await subject.save()

			data = await Data.findById(data._id).populate('obj').populate('refs').populate('subjects').exec()
			ctx.body = data.view()
		} else ctx.throw(401)
	} else ctx.throw(404)
})

// delete data by id
router.delete('/datas/:id', RBAC.auth(true), RBAC.middleware('datas:delete'), async (ctx) => {
	// can only delete the data if you are the owner of the data
	let data = await Data.findById(ctx.params.id).select({owners: 1}).exec()
	if (data) {
		if (await RBAC.check(ctx.state.user, 'datas:delete', data.owners)) {
			await Data.findByIdAndRemove(ctx.params.id).exec()

			ctx.status = 200
		} else ctx.throw(401)
	} else ctx.throw(404)
})

// add owner to data by data id and principal id
router.post('/datas/:id/owners/:principalId', RBAC.auth(true), RBAC.middleware('datas:addOwner'), async (ctx) => {
	// can only add owner to the data if you are the owner of the data
	let data = await Data.findById(ctx.params.id).select({owners: 1}).exec()
	if (data) {
		if (await RBAC.check(ctx.state.user, 'datas:addOwner', data.owners)) {
			if (data.owners.indexOf(ctx.params.principalId) === -1) data.owners.push(ctx.params.principalId)
			await data.save()

			ctx.status = 201
		} else ctx.throw(401)
	} else ctx.throw(404)
})

// remove owner from data by data id and principal id
router.delete('/datas/:id/owners/:principalId', RBAC.auth(true), RBAC.middleware('datas:removeOwner'), async (ctx) => {
	// can only remove owner from the data if you are the owner of the data
	let data = await Data.findById(ctx.params.id).select({owners: 1}).exec()
	if (data) {
		if (await RBAC.check(ctx.state.user, 'datas:removeOwner', data.owners)) {
			if (data.owners.indexOf(ctx.params.principalId) >= 0) data.owners.pop(ctx.params.principalId)
			await data.save()

			ctx.status = 200
		} else ctx.throw(401)
	} else ctx.throw(404)
})

module.exports = router

/*
Example requests:

GET http://localhost/api/datas

GET http://localhost/api/datas/:id

POST http://localhost/api/datas
{
	"field": "This is field",
	"arr": ["value1", "value2", "value3"],
	"obj": ObjectId,
	"refs": [ObjectId]
}

PUT http://localhost/api/datas/:id
{
	"field": "This is field",
	"arr": ["value1", "value2", "value3"],
	"obj": ObjectId,
	"refs": [ObjectId]
}

DELETE http://localhost/api/datas/:id

POST http://localhost/api/datas/:id/owners/:principalId

DELETE http://localhost/api/datas/:id/owners/:principalId

*/