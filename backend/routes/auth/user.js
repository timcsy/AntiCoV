const Router = require('koa-router')
const User = require('../../models/Auth/User')
const RBAC = require('../../lib/rbac')

const router = new Router()

// list all users
router.get('/users', RBAC.auth(), RBAC.middleware('users:list'), async (ctx) => {
	const users = await User.find({}).select({'owners': 1}).exec()
	const list = []
	for (const u of users)
		if (await RBAC.check(ctx.state.user, 'users:list', u.owners)) {
			const user = await User.findById(u._id).populate('identities').populate('roles').exec()
			list.push(user.view())
		}
	ctx.body = list
})

// get user by id
router.get('/users/:id', RBAC.auth(), RBAC.middleware('users:get'), async (ctx) => {
	// can only get the user if you are the user's owner
	let user = await User.findById(ctx.params.id).select({owners: 1}).exec()
	if (user) {
		if (await RBAC.check(ctx.state.user, 'users:get', user.owners)) {
			user = await User.findById(user._id).populate('identities').populate('roles').exec()
			ctx.body = user.view()
		} else ctx.throw(401)
	} else ctx.throw(404)
})

// delete the user by id
router.delete('/users/:id', RBAC.auth(), RBAC.middleware('users:delete'), async (ctx) => {
	// can only delete the user if you are the user's owner
	let user = await User.findById(ctx.params.id).select({owners: 1}).exec()
	if (user) {
		if (await RBAC.check(ctx.state.user, 'users:delete', user.owners)) {
			await User.findByIdAndRemove(user._id)
			ctx.status = 200
		} else ctx.throw(401)
	} else ctx.throw(404)
})

// add owner to user
router.post('/users/:id/owners/:owner', RBAC.auth(), RBAC.middleware('users:addOwner'), async (ctx) => {
	// can only add owner to the user if you are the user's and the owner's owner
	let user = await User.findById(ctx.params.id).select({owners: 1}).exec()
	const owner = await User.findById(ctx.params.owner).select({owners: 1}).exec()
	if (user && owner) {
		if (await RBAC.check(ctx.state.user, 'users:addOwner', user.owners) &&
				await RBAC.check(ctx.state.user, 'users:addOwner', owner.owners)) {
			if (user.owners.indexOf(owner._id) === -1) user.owners.push(owner._id)
			await user.save()
			ctx.status = 201
		} else ctx.throw(401)
	} else ctx.throw(404)
})

// delete owner from user
router.delete('/users/:id/owners/:owner', RBAC.auth(), RBAC.middleware('users:removeOwner'), async (ctx) => {
	// can only delete owner from the user if you are the user's and the owner's owner
	let user = await User.findById(ctx.params.id).select({owners: 1}).exec()
	const owner = await User.findById(ctx.params.owner).select({owners: 1}).exec()
	if (user && owner) {
		if (await RBAC.check(ctx.state.user, 'users:removeOwner', user.owners) &&
				await RBAC.check(ctx.state.user, 'users:removeOwner', owner.owners)) {
			if (user.owners.indexOf(owner._id) >= 0) user.owners.pop(owner._id)
			await user.save()
			ctx.status = 200
		} else ctx.throw(401)
	} else ctx.throw(404)
})

// add the user' roles by id
router.post('/users/:id/roles', RBAC.auth(), RBAC.middleware('users:addRoles'), async (ctx) => {
	// can only add roles to the user if you are the user's owner
	let user = await User.findById(ctx.params.id).select({owners: 1}).exec()
	if (user) {
		if (await RBAC.check(ctx.state.user, 'users:addRoles', user.owners)) {
			await RBAC.addUserRoles(user._id, ctx.request.body.roles)
			user = await User.findById(user._id).populate('roles', 'value').exec()
			ctx.status = 201
			ctx.body = user.roles.map(r => r.value)
		} else ctx.throw(401)
	} else ctx.throw(404)
})

// add the user' role by user id and rolename
router.post('/users/:id/roles/:rolename', RBAC.auth(), RBAC.middleware('users:addRoles'), async (ctx) => {
	// can only add role to the user if you are the user's owner
	let user = await User.findById(ctx.params.id).select({owners: 1}).exec()
	if (user) {
		if (await RBAC.check(ctx.state.user, 'users:addRoles', user.owners)) {
			await RBAC.addUserRoles(user._id, ctx.params.rolename)
			user = await User.findById(user._id).populate('roles', 'value').exec()
			ctx.status = 201
			ctx.body = user.roles.map(r => r.value)
		} else ctx.throw(401)
	} else ctx.throw(404)
})

// update the user' roles by id
router.put('/users/:id/roles', RBAC.auth(), RBAC.middleware('users:updateRoles'), async (ctx) => {
	// can only update roles of the user if you are the user's owner
	let user = await User.findById(ctx.params.id).select({owners: 1, roles: 1}).exec()
	if (user) {
		if (await RBAC.check(ctx.state.user, 'users:updateRoles', user.owners)) {
			user.roles = []
			await user.save()
			await RBAC.addUserRoles(user._id, ctx.request.body.roles)
			user = await User.findById(user._id).populate('roles', 'value').exec()
			ctx.body = user.roles.map(r => r.value)
		} else ctx.throw(401)
	} else ctx.throw(404)
})

// delete the user' roles by user id and rolename
router.delete('/users/:id/roles/:rolename', RBAC.auth(), RBAC.middleware('users:removeRoles'), async (ctx) => {
	// can only delete the role from the user if you are the user's owner
	let user = await User.findById(ctx.params.id).select({owners: 1, roles: 1}).exec()
	if (user) {
		if (await RBAC.check(ctx.state.user, 'users:removeRoles', user.owners)) {
			await RBAC.removeUserRoles(user._id, ctx.params.rolename)
			user = await User.findById(user._id).populate('roles', 'value').exec()
			ctx.body = user.roles.map(r => r.value)
		} else ctx.throw(401)
	} else ctx.throw(404)
})

// add the user' permissions by id
router.post('/users/:id/permissions', RBAC.auth(), RBAC.middleware('users:addPermissions'), async (ctx) => {
	// can only add permissions to the user if you are the user's owner
	let user = await User.findById(ctx.params.id).select({owners: 1}).exec()
	if (user) {
		if (await RBAC.check(ctx.state.user, 'users:addPermissions', user.owners)) {
			await RBAC.addUserPermissions(user._id, ctx.request.body.permissions, ctx.request.body.action)
			user = await User.findById(user._id).exec()
			ctx.status = 201
			ctx.body = {
				permissions: user.permissions,
				action: user.action
			}
		} else ctx.throw(401)
	} else ctx.throw(404)
})

// update the user' permissions by id
router.put('/users/:id/permissions', RBAC.auth(), RBAC.middleware('users:updatePermissions'), async (ctx) => {
	// can only update permissions of the user if you are the user's owner
	let user = await User.findById(ctx.params.id).select({owners: 1, permissions: 1, action: 1}).exec()
	if (user) {
		if (await RBAC.check(ctx.state.user, 'users:updatePermissions', user.owners)) {
			user.permissions = []
			await user.save()
			await RBAC.addUserPermissions(user._id, ctx.request.body.permissions, ctx.request.body.action)
			user = await User.findById(user._id).exec()
			ctx.body = {
				permissions: user.permissions,
				action: user.action
			}
		} else ctx.throw(401)
	} else ctx.throw(404)
})

// delete the user' permissions by user id and permission
router.delete('/users/:id/permissions/:permission/:action', RBAC.auth(), RBAC.middleware('users:removePermissions'), async (ctx) => {
	// can only delete permission from the user if you are the user's owner
	let user = await User.findById(ctx.params.id).select({owners: 1}).exec()
	if (user) {
		if (await RBAC.check(ctx.state.user, 'users:removePermissions', user.owners)) {
			await RBAC.removeUserPermissions(user._id, ctx.params.permission, ctx.params.action)
			user = await User.findById(user._id).exec()
			ctx.body = {
				permissions: user.permissions,
				action: user.action
			}
		} else ctx.throw(401)
	} else ctx.throw(404)
})

module.exports = router