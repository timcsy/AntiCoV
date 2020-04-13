const Router = require('koa-router')
const passport = require('../../lib/passort')
const JWTConfig = require('../../config/jwt')
const jwt = require('jsonwebtoken')
const Identity = require('../../models/Auth/Identity')
const Local = require('../../models/Auth/Local')
const User = require('../../models/Auth/User')
const RBAC = require('../../lib/rbac')

const router = new Router()

// list all identities
router.get('/identities', RBAC.auth(), RBAC.middleware('identities:list'), async (ctx) => {
	const user = await User.findById(ctx.state.user).populate('identities').exec()
	ctx.body = user.identities.map(i => i.view())
})

// get identity by id
router.get('/identities/:id', RBAC.auth(), RBAC.middleware('identities:get'), async (ctx) => {
	// can only get the identity if you are the identity's user's owner
	const identity = await Identity.findById(ctx.params.id).exec()
	if (identity) {
		const user = await User.findById(identity.user).select({owners: 1}).exec()
		if (user) {
			if (await RBAC.check(ctx.state.user, 'identities:get', user.owners)) {
				ctx.body = identity.view()
			} else ctx.throw(401)
		} else ctx.throw(404)
	} else ctx.throw(404)
})

// unlink
router.get('/unlink/:id', RBAC.auth(), RBAC.middleware('identities:unlink'), async (ctx) => {
	// can only get the identity if you are the identity's user's owner
	const identity = await Identity.findById(ctx.params.id).exec()
	if (identity) {
		const user = await User.findById(identity.user).select({owners: 1}).exec()
		if (user) {
			if (await RBAC.check(ctx.state.user, 'identities:unlink', user.owners)) {
				await identity.unlink()
				ctx.status = 200
			} else ctx.throw(401)
		} else ctx.throw(404)
	} else ctx.throw(404)
})

// local check username is used or not
router.get('/local/username/:username', RBAC.auth(true), RBAC.middleware('local:username'), async (ctx) => {
	const identity = await Local.findOne({username: ctx.params.username}).exec()
	if (identity) ctx.body = true
	else ctx.body = false
})

// local login/connect (api version)
router.post('/login', RBAC.auth(true), passport.authenticate('local-login', {session: false}), async (ctx) => {
	// generate a signed json web token with the contents of user object and return it in the response
	const token = jwt.sign({user: ctx.state.user}, JWTConfig.secret, {
		expiresIn: JWTConfig.expires || '1d' // expires in 1 day
	})
	ctx.body = token
})

// local signup/connect (api version)
router.post('/signup', RBAC.auth(true), passport.authenticate('local-signup', {session: false}), async (ctx) => {
	// generate a signed json web token with the contents of user object and return it in the response
	const token = jwt.sign({user: ctx.state.user}, JWTConfig.secret, {
		expiresIn: JWTConfig.expires || '1d' // expires in 1 day
	})
	ctx.body = token
})

// facebook login/signup/connect (api version), the body should have access_token field
router.post('/facebook', RBAC.auth(true), passport.authenticate('facebook-token', {session: false}), async (ctx) => {
	// generate a signed json web token with the contents of user object and return it in the response
	const token = jwt.sign({user: ctx.state.user}, JWTConfig.secret, {
		expiresIn: JWTConfig.expires || '1d' // expires in 1 day
	})
	ctx.body = token
})

/*

edit identity profile
including local, facebook, forget password, change password, ...

*/

// delete the identity by id
router.delete('/identities/:id', RBAC.auth(), RBAC.middleware('identities:delete'), async (ctx) => {
	// can only delete the identity if you are the identity's user's owner
	const identity = await Identity.findById(ctx.params.id).exec()
	if (identity) {
		let user = await User.findById(identity.user).select({owners: 1}).exec()
		if (user) {
			if (await RBAC.check(ctx.state.user, 'identities:delete', user.owners)) {
				await Identity.findByIdAndRemove(identity._id)
				ctx.status = 200
			} else ctx.throw(401)
		} else ctx.throw(404)
	} else ctx.throw(404)
})

module.exports = router