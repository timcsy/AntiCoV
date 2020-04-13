const Router = require('koa-router')
const Group = require('../../models/Auth/Group')
const User = require('../../models/Auth/User')
const RBAC = require('../../lib/rbac')

const router = new Router()

// list groups of current user
router.get('/groups', RBAC.auth(), RBAC.middleware('groups:list'), async (ctx) => {
	// can only view the groups of the current user
	const user = await User.findById(ctx.state.user).populate('groups').exec()
	ctx.body = user.groups.map(g => g.view('info'))
})

// get group by id
router.get('/groups/:id', RBAC.auth(), RBAC.middleware('groups:get'), async (ctx) => {
	// can only view the group the user is in
	const user = await User.findById(ctx.state.user).exec()
	if (user.groups.indexOf(ctx.params.id) >= 0) {
		const group = await Group.findById(ctx.params.id).populate('users', '_id').exec()
		if (group) ctx.body = group.view()
		else ctx.throw(404)
	} else ctx.throw(401)
})

// create a group and add current user to the group
router.post('/groups', RBAC.auth(), RBAC.middleware('groups:post'), async (ctx) => {
	let group = new Group()
	group.name = ctx.request.body.name
	await group.save()

	const user = await User.findById(ctx.state.user).exec()
	user.groups.push(group)
	await user.save()

	group = await Group.findById(group._id).populate('users', '_id').exec()
	ctx.body = group.view()
	ctx.status = 201
	ctx.set('Location', '/api/groups/' + group._id)
})

// update the group by id
router.put('/groups/:id', RBAC.auth(), RBAC.middleware('groups:put'), async (ctx) => {
	// can only edit the group the user is in
	const user = await User.findById(ctx.state.user).exec()
	if (user.groups.indexOf(ctx.params.id) >= 0) {
		let group = await Group.findById(ctx.params.id).exec()
		if (group) {
			group.name = ctx.request.body.name
			await group.save()

			group = await Group.findById(group._id).populate('users', '_id').exec()
			ctx.body = group.view()
		} else ctx.throw(404)
	} else ctx.throw(401)
})

// delete the group by id
router.delete('/groups/:id', RBAC.auth(), RBAC.middleware('groups:delete'), async (ctx) => {
	// only delete the group the user is in
	const user = await User.findById(ctx.state.user).exec()
	if (user.groups.indexOf(ctx.params.id) >= 0) {
		const group = await Group.findById(ctx.params.id).exec()
		await group.delete()
		ctx.status = 200
	} else ctx.throw(401)
})

// find group by id and list users of the group
router.get('/groups/:id/users', RBAC.auth(), RBAC.middleware('groups:listUsers'), async (ctx) => {
	// can only view the group the user is in, and only get the user._id
	const user = await User.findById(ctx.state.user).exec()
	if (user.groups.indexOf(ctx.params.id) >= 0) {
		const users = await User.find({"groups": ctx.params.id}).select({_id: 1}).exec()
		ctx.body = users.map(u => u._id)
		ctx.status = 200
	}
})

// find group by id and add current user to the group
router.post('/groups/:id/users', RBAC.auth(), RBAC.middleware('groups:addUser'), async (ctx) => {
	const user = await User.findById(ctx.state.user).exec()
	if(user.groups.indexOf(ctx.params.id) === -1) user.groups.push(ctx.params.id)
	await user.save()

	ctx.status = 201
})

// find group by id and add user by id to the group
router.post('/groups/:groupId/users/:userId', RBAC.auth(), RBAC.middleware('groups:addUser'), async (ctx) => {
	// can only view the group the user is in, and only get the user._id
	const currentUser = await User.findById(ctx.state.user).exec()
	if (currentUser.groups.indexOf(ctx.params.groupId) >= 0) {
		const user = await User.findById(ctx.params.userId).exec()
		if(user.groups.indexOf(ctx.params.groupId) === -1) user.groups.push(ctx.params.groupId)
		await user.save()

		ctx.status = 201
	} else ctx.throw(401)
})

// find group by id and delete current user from the group
router.delete('/groups/:id/users', RBAC.auth(), RBAC.middleware('groups:removeUser'), async (ctx) => {
	// can only leave the group the user is in
	const user = await User.findById(ctx.state.user).exec()
	if (user.groups.indexOf(ctx.params.id) >= 0) {
		user.groups.pop(ctx.params.id)
		await user.save()

		ctx.status = 200
	} else ctx.throw(401)
})

// find group by id and delete user by id from the group
router.delete('/groups/:groupId/users/:userId', RBAC.auth(), RBAC.middleware('groups:removeUser'), async (ctx) => {
	// can only delete the member in the same group of current user
	const currentUser = await User.findById(ctx.state.user).exec()
	if (currentUser.groups.indexOf(ctx.params.groupId) >= 0) {
		const user = await User.findById(ctx.params.userId).exec()
		if(user && user.groups.indexOf(ctx.params.groupId) >= 0) {
			user.groups.pop(ctx.params.groupId)
			await user.save()

			ctx.status = 200
		} else ctx.throw(401)
	}
})

// add the roles to group by group id
router.post('/groups/:id/roles', RBAC.auth(), RBAC.middleware('groups:addRoles'), async (ctx) => {
	// can only add roles to the group the current user is in
	const user = await User.findById(ctx.state.user).exec()
	if (user.groups.indexOf(ctx.params.id) >= 0) {
		let group = await Group.findById(ctx.params.id).exec()
		if (group) {
			await RBAC.addGroupRoles(group._id, ctx.request.body.roles)
			group = await Group.findById(group._id).populate('roles', 'value').exec()
			ctx.status = 201
			ctx.body = group.roles.map(r => r.value)
		} else ctx.throw(404)
	} else ctx.throw(401)
})

// add the role to group by group id and rolename
router.post('/groups/:id/roles/:rolename', RBAC.auth(), RBAC.middleware('groups:addRoles'), async (ctx) => {
	// can only add role to the group the current user is in
	const user = await User.findById(ctx.state.user).exec()
	if (user.groups.indexOf(ctx.params.id) >= 0) {
		let group = await Group.findById(ctx.params.id).exec()
		if (group) {
			await RBAC.addGroupRoles(group._id, ctx.params.rolename)
			group = await Group.findById(group._id).populate('roles', 'value').exec()
			ctx.status = 201
			ctx.body = group.roles.map(r => r.value)
		} else ctx.throw(404)
	} else ctx.throw(401)
})

// update the roles of group by group id
router.put('/groups/:id/roles', RBAC.auth(), RBAC.middleware('groups:updateRoles'), async (ctx) => {
	// can only update roles of the group the current user is in
	const user = await User.findById(ctx.state.user).exec()
	if (user.groups.indexOf(ctx.params.id) >= 0) {
		let group = await Group.findById(ctx.params.id).exec()
		if (group) {
			group.roles = []
			await group.save()
			await RBAC.addGroupRoles(group._id, ctx.request.body.roles)
			group = await Group.findById(group._id).populate('roles', 'value').exec()
			ctx.body = group.roles.map(r => r.value)
		} else ctx.throw(404)
	} else ctx.throw(401)
})

// delete the role from group by group id and rolename
router.delete('/groups/:id/roles/:rolename', RBAC.auth(), RBAC.middleware('groups:removeRoles'), async (ctx) => {
	// can only delete role from the group the current user is in
	const user = await User.findById(ctx.state.user).exec()
	if (user.groups.indexOf(ctx.params.id) >= 0) {
		let group = await Group.findById(ctx.params.id).exec()
		if (group) {
			await RBAC.removeGroupRoles(group._id, ctx.params.rolename)
			group = await Group.findById(group._id).populate('roles', 'value').exec()
			ctx.body = group.roles.map(r => r.value)
		} else ctx.throw(404)
	} else ctx.throw(401)
})

// add the permissions to group by group id
router.post('/groups/:id/permissions', RBAC.auth(), RBAC.middleware('groups:addPermissions'), async (ctx) => {
	// can only add permissions to the group the current user is in
	const user = await User.findById(ctx.state.user).exec()
	if (user.groups.indexOf(ctx.params.id) >= 0) {
		let group = await Group.findById(ctx.params.id).exec()
		if (group) {
			await RBAC.addGroupPermissions(group._id, ctx.request.body.permissions, ctx.request.body.action)
			group = await Group.findById(group._id).exec()
			ctx.status = 201
			ctx.body = {
				permissions: group.permissions,
				action: group.action
			}
		} else ctx.throw(404)
	} else ctx.throw(401)
})

// update the permissions of group by group id
router.put('/groups/:id/permissions', RBAC.auth(), RBAC.middleware('groups:updatePermissions'), async (ctx) => {
	// can only update permissions of the group the current user is in
	const user = await User.findById(ctx.state.user).exec()
	if (user.groups.indexOf(ctx.params.id) >= 0) {
		let group = await Group.findById(ctx.params.id).exec()
		if (group) {
			group.permissions = []
			await group.save()
			await RBAC.addGroupPermissions(group._id, ctx.request.body.permissions, ctx.request.body.action)
			group = await Group.findById(group._id).exec()
			ctx.body = {
				permissions: group.permissions,
				action: group.action
			}
		} else ctx.throw(404)
	} else ctx.throw(401)
})

// delete the permissions from group by group id and permissison
router.delete('/groups/:id/permissions/:permission/:action', RBAC.auth(), RBAC.middleware('groups:removePermissions'), async (ctx) => {
	// can only delete permissions from the group the current user is in
	const user = await User.findById(ctx.state.user).exec()
	if (user.groups.indexOf(ctx.params.id) >= 0) {
		let group = await Group.findById(ctx.params.id).exec()
		if (group) {
			await RBAC.removeGroupPermissions(group._id, ctx.params.permission, ctx.params.action)
			group = await Group.findById(group._id).exec()
			ctx.body = {
				permissions: group.permissions,
				action: group.action
			}
		} else ctx.throw(404)
	} else ctx.throw(401)
})

module.exports = router