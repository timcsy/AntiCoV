const Router = require('koa-router')
const Role = require('../../models/Auth/Role')
const RBAC = require('../../lib/rbac')

const router = new Router()

// list all roles
router.get('/roles', RBAC.auth(), RBAC.middleware('roles:list'), async (ctx) => {
	const roles = await Role.find({}).populate('inherits', 'value').exec()
	ctx.body = roles.map(r => r.view())
})

// get role by name
router.get('/roles/:rolename', RBAC.auth(), RBAC.middleware('roles:get'), async (ctx) => {
	const role = await Role.findOne({value: ctx.params.rolename}).populate('inherits', 'value').exec()
	if (role) ctx.body = role.view()
	else ctx.throw(404)
})

// create a role
router.post('/roles', RBAC.auth(), RBAC.middleware('roles:post'), async (ctx) => {
	await RBAC.addRoles({
		value: ctx.request.body.value,
		permissions: ctx.request.body.permissions,
		action: ctx.request.body.action,
		inherits: ctx.request.body.inherits
	})

	const role = await Role.findOne({value: ctx.request.body.value}).populate('inherits', 'value').exec()
	ctx.body = role.view()
	ctx.status = 201
	ctx.set('Location', '/api/roles/' + role.value)
})

// update the role by rolename
router.put('/roles/:rolename', RBAC.auth(), RBAC.middleware('roles:put'), async (ctx) => {
	let role = await Role.findOrCreate(ctx.params.rolename)
	role.permissions = []
	role.inherits = []
	await role.save()

	await RBAC.addRoles({
		value: ctx.params.rolename,
		permissions: ctx.request.body.permissions,
		action: ctx.request.body.action,
		inherits: ctx.request.body.inherits
	})

	role = await Role.findOne({value: ctx.params.rolename}).populate('inherits', 'value').exec()
	if (role) ctx.body = role.view()
	else ctx.throw(404)
})

// update all the roles
router.put('/roles', RBAC.auth(), RBAC.middleware('roles:config'), async (ctx) => {
	await RBAC.config(ctx.request.body.roles)
	const roles = await Role.find({}).populate('inherits', 'value').exec()
	ctx.body = roles.map(r => r.view())
})

// delete the role by rolename
router.delete('/roles/:rolename', RBAC.auth(), RBAC.middleware('roles:delete'), async (ctx) => {
	// not implemented cascade delete
	await RBAC.removeRoles(ctx.params.rolename)
	ctx.status = 200
})

module.exports = router