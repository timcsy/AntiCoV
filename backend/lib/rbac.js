const minimatch = require('minimatch')
const passport = require('koa-passport')
const Role = require('../models/Auth/Role')
const User = require('../models/Auth/User')
const Group = require('../models/Auth/Group')
// Local / Identity cannot put here because recursive import

/** RBAC (Role-based Access Control) */
class RBAC {
	/**
	 * Add role(s) to given principal which contains roles field.
	 * 
	 * @param  {User|Group} Principal - either User or Group class
	 * @param  {string} principalId - the _id of principal
	 * @param  {string|string[]} roles - either a rolename or array of rolenames
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async addPrincipalRoles(Principal, principalId, roles) {
		const principal = await Principal.findById(principalId).exec()
		if (principal) {
			if (typeof roles === 'string') {
				const role = await Role.findOrCreate(roles)
				if (principal.roles.indexOf(role._id) === -1) principal.roles.push(role)
				await principal.save()
			} else if (Array.isArray(roles)) {
				for (const r of roles) {
					const role = await Role.findOrCreate(r)
					if (principal.roles.indexOf(role._id) === -1) principal.roles.push(role)
					await principal.save()
				}
			}
		}
	}

	/**
	 * Add role(s) to given uesr.
	 * 
	 * @param  {string} userId - the _id of user
	 * @param  {string|string[]} roles - either a rolename or array of rolenames
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async addUserRoles(userId, roles) {
		await this.addPrincipalRoles(User, userId, roles)
	}

	/**
	 * Add role(s) to given group.
	 * 
	 * @param  {string} groupId - the _id of group
	 * @param  {string|string[]} roles - either a rolename or array of rolenames
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async addGroupRoles(groupId, roles) {
		await this.addPrincipalRoles(Group, groupId, roles)
	}

	/**
	 * Remove role(s) from given principal which contains roles field.
	 * 
	 * @param  {User|Group} Principal - either User or Group class
	 * @param  {string} principalId - the _id of principal
	 * @param  {string|string[]} roles - either a rolename or array of rolenames
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async removePrincipalRoles(Principal, principalId, roles) {
		const principal = await Principal.findById(principalId).exec()
		if (principal) {
			if (typeof roles === 'string') {
				const role = await Role.findOne({value: roles}).exec()
				if (role) {
					const index = principal.roles.indexOf(role._id)
					principal.roles.splice(index, 1)
					await principal.save()
				}
			} else if (Array.isArray(roles)) {
				for (const r of roles) {
					const role = await Role.findOne({value: r}).exec()
					if (role) {
						const index = principal.roles.indexOf(role._id)
						principal.roles.splice(index, 1)
					}
				}
				await principal.save()
			}
		}
	}

	/**
	 * Remove role(s) from given user.
	 * 
	 * @param  {string} userId - the _id of user
	 * @param  {string|string[]} roles - either a rolename or array of rolenames
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async removeUserRoles(userId, roles) {
		await this.removePrincipalRoles(User, userId, roles)
	}

	/**
	 * Remove role(s) from given group.
	 * 
	 * @param  {string} userId - the _id of group
	 * @param  {string|string[]} roles - either a rolename or array of rolenames
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async removeGroupRoles(groupId, roles) {
		await this.removePrincipalRoles(Group, groupId, roles)
	}

	/**
	 * Add ancestor role(s) to the role.
	 * 
	 * @param  {string} rolename - the name of role
	 * @param  {string|string[]} inherits - either a rolename or array of rolenames
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async addRoleInherits(rolename, inherits) {
		if (typeof inherits === 'string') {
			const role = await Role.findOrCreate(rolename)
			const parent = await Role.findOrCreate(inherits)
			if (role.inherits.indexOf(parent._id) === -1) role.inherits.push(parent)
			await role.save()
		} else if (Array.isArray(inherits)) {
			const role = await Role.findOrCreate(rolename)
			for (const r of inherits) {
				const parent = await Role.findOrCreate(r)
				if (role.inherits.indexOf(parent._id) === -1) role.inherits.push(parent)
				await role.save()
			}
		}
	}

	/**
	 * Remove ancestor role(s) from the role.
	 * 
	 * @param  {string} rolename - the name of role
	 * @param  {string|string[]} inherits - either a rolename or array of rolenames
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async removeRoleInherits(rolename, inherits) {
		if (typeof inherits === 'string') {
			const role = await Role.findOne({value: rolename}).exec()
			if (role) {
				const parent = await Role.findOne({value: inherits}).exec()
				if (parent) {
					const index = role.inherits.indexOf(parent._id)
					role.inherits.splice(index, 1)
					await role.save()
				}
			}
		} else if (Array.isArray(inherits)) {
			const role = await Role.findOne({value: rolename}).exec()
			if (role) {
				for (const r of inherits) {
					const parent = await Role.findOne({value: r}).exec()
					if (parent) {
						const index = role.inherits.indexOf(parent._id)
						role.inherits.splice(index, 1)
					}
				}
				await role.save()
			}
		}
	}

	/**
	 * Add permission(s) and change action(allow or deny) to principal which has permissions and action fields.
	 * 
	 * The origin permission(s) will only be kept if the action matches.
	 * 
	 * @param  {User|Group} Principal - either User or Group class
	 * @param  {string} principalId - the _id of principal
	 * @param  {string|string[]} permissions - either a permission or array of permissions
	 * @param  {('allow'|'deny')} action - either 'allow' or 'deny'
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async addPrincipalPermissions(Principal, principalId, permissions, action) {
		action = action || 'allow'
		const principal = await Principal.findById(principalId).exec()
		if (principal) {
			if (principal.action !== action) {
				principal.action = action
				principal.permissions = []
			}
			if (typeof permissions === 'string') {
				if (principal.permissions.indexOf(permissions) === -1) principal.permissions.push(permissions)
			} else if (Array.isArray(permissions)) {
				for (const p of permissions)
					if (principal.permissions.indexOf(p) === -1) principal.permissions.push(p)
					await principal.save()
			}
		}
	}

	/**
	 * Add permission(s) and change action(allow or deny) to user.
	 * 
	 * The origin permission(s) will only be kept if the action matches.
	 * 
	 * @param  {string} userId - the _id of user
	 * @param  {string|string[]} permissions - either a permission or array of permissions
	 * @param  {('allow'|'deny')} action - either 'allow' or 'deny'
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async addUserPermissions(userId, permissions, action) {
		await this.addPrincipalPermissions(User, userId, permissions, action)
	}

	/**
	 * Add permission(s) and change action(allow or deny) to group.
	 * 
	 * The origin permission(s) will only be kept if the action matches.
	 * 
	 * @param  {string} groupId - the _id of group
	 * @param  {string|string[]} permissions - either a permission or array of permissions
	 * @param  {('allow'|'deny')} action - either 'allow' or 'deny'
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async addGroupPermissions(groupId, permissions, action) {
		await this.addPrincipalPermissions(Group, groupId, permissions, action)
	}

	/**
	 * Add permission(s) and change action(allow or deny) to role.
	 * 
	 * The origin permission(s) will only be kept if the action matches.
	 * 
	 * @param  {string} rolename - the name of role
	 * @param  {string|string[]} permissions - either a permission or array of permissions
	 * @param  {('allow'|'deny')} action - either 'allow' or 'deny'
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async addRolePermissions(rolename, permissions, action) {
		action = action || 'allow'
		const role = await Role.findOrCreate(rolename)
		if (role.action !== action) {
			role.action = action
			role.permissions = []
		}
		if (typeof permissions === 'string') {
			if (role.permissions.indexOf(permissions) === -1) role.permissions.push(permissions)
			await role.save()
		} else if (Array.isArray(permissions)) {
			for (const p of permissions)
				if (role.permissions.indexOf(p) === -1) role.permissions.push(p)
				await role.save()
		}
	}

	/**
	 * Remove permission(s) from principal which has permissions and action fields.
	 * 
	 * The permission(s) will only be removed if the action matches.
	 * 
	 * @param  {User|Group} Principal - either User or Group class
	 * @param  {string} principalId - the _id of principal
	 * @param  {string|string[]} permissions - either a permission or array of permissions
	 * @param  {('allow'|'deny')} action - either 'allow' or 'deny'
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async removePrincipalPermissions(Principal, principalId, permissions, action) {
		action = action || 'allow'
		const principal = await Principal.findById(principalId).exec()
		if (principal) {
			if (principal.action === action) { // The action should be the same, otherwise reject
				if (typeof permissions === 'string') {
					const index = principal.permissions.indexOf(permissions)
					principal.permissions.splice(index, 1)
				} else if (Array.isArray(permissions)) {
					for (const p of permissions) {
						const index = principal.permissions.indexOf(p)
						principal.permissions.splice(index, 1)
					}
				}
				await principal.save()
			}
		}
	}

	/**
	 * Remove permission(s) from user.
	 * 
	 * The permission(s) will only be removed if the action matches.
	 * 
	 * @param  {string} userId - the _id of user
	 * @param  {string|string[]} permissions - either a permission or array of permissions
	 * @param  {('allow'|'deny')} action - either 'allow' or 'deny'
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async removeUserPermissions(userId, permissions, action) {
		await this.removePrincipalPermissions(User, userId, permissions, action)
	}

	/**
	 * Remove permission(s) from group.
	 * 
	 * The permission(s) will only be removed if the action matches.
	 * 
	 * @param  {string} groupId - the _id of user
	 * @param  {string|string[]} permissions - either a permission or array of permissions
	 * @param  {('allow'|'deny')} action - either 'allow' or 'deny'
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async removeGroupPermissions(groupId, permissions, action) {
		await this.removePrincipalPermissions(Group, groupId, permissions, action)
	}

	/**
	 * Remove permission(s) from role.
	 * 
	 * The permission(s) will only be removed if the action matches.
	 * 
	 * @param  {string} rolename - the name of role
	 * @param  {string|string[]} permissions - either a permission or array of permissions
	 * @param  {('allow'|'deny')} action - either 'allow' or 'deny'
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async removeRolePermissions(rolename, permissions, action) {
		action = action || 'allow'
		const role = await Role.findOne({value: rolename}).exec()
		if (role) {
			if (role.action === action) {
				if (typeof permissions === 'string') {
					const index = role.permissions.indexOf(permissions)
					role.permissions.splice(index, 1)
				} else if (Array.isArray(permissions)) {
					for (const p of permissions) {
						const index = role.permissions.indexOf(p)
						role.permissions.splice(index, 1)
					}
				}
				await role.save()
			}
		}
	}

	/**
	 * The role object used to add / remove role(s).
	 * 
	 * @typedef {Object} RoleObject
	 * @property {string} value - name of the role
	 * @property {string[]} permissions - array of permissions
	 * @property {('allow'|'deny')} action - either allow or deny
	 * @property {string[]} inherits - array of rolenames of acess
	 */

	/**
	 * Add role(s) to Database.
	 * 
	 * @param  {RoleObject|RoleObject[]} roles - either a role object or array of role objects
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async addRoles(roles) {
		if (!Array.isArray(roles)) {
			if (roles.value && roles.permissions)
				await this.addRolePermissions(roles.value, roles.permissions, roles.action)
			if (roles.value && roles.inherits)
				await this.addRoleInherits(roles.value, roles.inherits)
		} else if (Array.isArray(roles)) {
			for (const r of roles) 
				await this.addRoles(r)
		}
	}

	/**
	 * Remove role(s) from Database.
	 * 
	 * @param  {RoleObject|RoleObject[]} roles - either a role object or array of role objects
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async removeRoles(roles) {
		if (!Array.isArray(roles)) {
			await Role.findOneAndRemove({value: roles}).exec()
		} else if (Array.isArray(roles)) {
			for (const r of roles)
				await Role.findOneAndRemove({value: r}).exec()
		}
	}

	/**
	 * Edit role(s) in Database to the current version.
	 * 
	 * @param  {RoleObject|RoleObject[]} roles - either a role object or array of role objects
	 * @returns  {Promise<undefined>} - wait for process
	 */
	static async config(roles) {
		// remove the redundant roles
		const list = await Role.find({}).select({value: 1}).exec()
		for (const i of list) {
			let flag = true
			if (Array.isArray(roles))
				for (const j of roles)
					if (i.value === j.value) {
						flag = false
						break
					}
			if (flag) await Role.findByIdAndRemove(i._id).exec()
		}
		
		// create or update left roles
		if (Array.isArray(roles))
			for (const r of roles) {
				if (r.value) {
					const role = await Role.findOrCreate(r.value)
					role.permissions = r.permissions || []
					role.action = r.action
					role.inherits = []
					await role.save()
					if (r.inherits) await this.addRoleInherits(r.value, r.inherits)
				}
			}
	}

	/**
	 * Tests str against the pattern which should be in resource:method form.
	 * 
	 * Support for glob notation.
	 * 
	 * @param  {string} str - string to test
	 * @param  {string} pattern - pattern to verify
	 * @returns  {boolean} - matches or not
	 */
	static match(str, pattern) {
		// including glob(translate to regex)
		const arr_str = str.split(':')
		const arr_pattern = pattern.split(':')
		if (arr_str.length !== 2) throw(new Error('Permission should be resource:method pattern'))
		if (arr_pattern.length !== 2) throw(new Error('Permission should be resource:method pattern'))
		return minimatch(arr_str[0], arr_pattern[0]) && minimatch(arr_str[1], arr_pattern[1])
	}

	/**
	 * Test if the object(should have permissions and action(optional) field) has permission.
	 * 
	 * @param  {Object} obj - object to test (should have permissions and action(optional) field)
	 * @param  {string} permission - permisison to find
	 * @returns  {boolean} - returns true if the object has permission
	 */
	static hasPermission(obj, permission) {
		if (obj.action === 'allow') {
			for (const p of obj.permissions)
				if (this.match(permission, p)) return true
			return false
		} else if (obj.action === 'deny') {
			for (const p of obj.permissions)
				if (this.match(permission, p)) return false
			return true
		} else return false
	}

	
	/**
	 * Find if the user has permission.
	 * 
	 * Order: user -> roles of user -> groups of user.
	 * 
	 * @param  {string} userId - the _id of user
	 * @param  {string} permission - permission to check
	 * @return  {Promise<boolean>} - resolves true if found the permission
	 */
	static async findUserPermission(userId, permission) {
		const user = await User.findById(userId).exec()
		if (user) {
			// find all the permissions of user
			if (this.hasPermission(user, permission)) return true
			// find all the permissions of user's roles
			for (const rId of user.roles)
				if (await this._findRolePermission(rId, permission)) return true
			// find all the permissions of user's groups
			for (const gId of user.groups)
				if (await this.findGroupPermission(gId, permission)) return true
		}
		return false
	}

	/**
	 * Find if the group has permission.
	 * 
	 * Order: group -> roles of group.
	 * 
	 * @param  {string} groupId - the _id of group
	 * @param  {string} permission - permission to check
	 * @return  {Promise<boolean>} - resolves true if found the permission
	 */
	static async findGroupPermission(groupId, permission) {
		const group = await Group.findById(groupId).exec()
		if (group) {
			// find all the permissions of group
			if (this.hasPermission(group, permission)) return true
			// find all the permissions of group's roles
			for (const rId of group.roles)
				if (await this._findRolePermission(rId, permission)) return true
		}
		return false
	}

	/**
	 * Find if the role has permission. (name version)
	 * 
	 * Order: role -> ancestor of role.
	 * 
	 * @param  {string} rolename - the name of role
	 * @param  {string} permission - permission to check
	 * @return  {Promise<boolean>} - resolves true if found the permission
	 */
	static async findRolePermission(rolename, permission) {
		const role = await Role.findOne({value: rolename}).exec()
		if (role)	return this._findRolePermission(role._id, permission)
		return false
	}

	/**
	 * Find if the role has permission. (_id version)
	 * 
	 * Order: role -> ancestor of role.
	 * 
	 * @param  {string} roleId - the _id of role
	 * @param  {string} permission - permission to check
	 * @return  {Promise<boolean>} - resolves true if found the permission
	 */
	static async _findRolePermission(roleId, permission) {
		const role = await Role.findById(roleId).exec()
		if (role) {
			// find all the permissions of role
			if (this.hasPermission(role, permission)) return true
			// find all the permissions of role's inherited roles
			for (const rId of role.inherits)
				if (await this._findRolePermission(rId, permission)) return true
		}
		return false
	}

	/**
	 * Middleware that check if the request is authenticated.
	 * 
	 * Order: Native(check ctx.state.user, possibly from session) -> JWT(passport-jwt) -> guest -> unauthenticated
	 * 
	 * The guest will be saved in ctx.state.user but not affect login or connect
	 * 
	 * @param  {boolean} guest - if not authenticated, view as guest or not(unauthenticated)
	 * @returns - returns a koa-router middleware
	 */
	static auth(guest) { // guest is false by default
		return async (ctx, next) => {
			if (ctx.isAuthenticated()) await next()
			else {
				let flag = true
				await passport.authenticate('jwt', {session: false})(ctx, async () => {
					flag = false
					await next()
				})
				if (flag && guest) {
					ctx.state.user = await User.guest()
					ctx.status = 200
					await next()
				}
			}
		}
	}

	/**
	 * Middleware that check if the user has permission. (wrapper of findUserPermission)
	 * 
	 * @param  {string} permission - permission to check
	 * @returns - returns a koa-router middleware
	 */
	static middleware(permission) {
		return async (ctx, next) => {
			const available = await this.findUserPermission(ctx.state.user, permission)
			if (available) await next()
			else ctx.throw(401)
		}
	}
	
	/**
	 * Check if the user has permission and is in the principal list
	 * 
	 * (will also check the groups of the user).
	 * 
	 * @param  {string} userId - the _id of the user
	 * @param  {string} permission - the permission to check
	 * @param  {string[]} principals - the principal list (array of _ids of users and groups)
	 * @returns  {Promise<boolean>} - true if the user has the permission and is in the principal list
	 */
	static async check(userId, permission, principals) {
		if (Array.isArray(principals)) { // if principals is array check if the user or the user's group is in it and has permission
			// check user means heck all the group of the user
			if (principals.indexOf(userId) >= 0) return await this.findUserPermission(userId, permission)
			const user = await User.findById(userId).exec()
			for (const gId of user.groups)
				if (principals.indexOf(gId) >= 0) return await this.findGroupPermission(gId, permission)
			return false
		}
		return await this.findUserPermission(userId, permission)
	}
}

module.exports = RBAC