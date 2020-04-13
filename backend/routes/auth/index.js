const Router = require('koa-router')
const passport = require('../../lib/passort')
const JWTConfig = require('../../config/jwt')
const jwt = require('jsonwebtoken')
const Identity = require('../../models/Auth/Identity')
const User = require('../../models/Auth/User')
const RBAC = require('../../lib/rbac')

const router = new Router()

////////////////////////////////////////////////////////////
//                     Authenticate                       //
////////////////////////////////////////////////////////////

// local------------------------------------------------
// login
router.post('/login', passport.authenticate('local-login', {
	failureRedirect: '/login'
}), async (ctx) => {
	// generate a signed json web token with the contents of user object and return it in the response
	const token = jwt.sign({user: ctx.state.user}, JWTConfig.secret, {
		expiresIn: JWTConfig.expires || '1d' // expires in 1 day
	})
	// even xhr call it will set cookie (axios can set cookie, but not redirect)
	ctx.cookies.set('jwt_token', token, {signed: true, httpOnly: true})
	ctx.redirect('/member') // successRedirect
})

// signup
router.post('/signup', passport.authenticate('local-signup', {
	failureRedirect: '/signup'
}), async (ctx) => {
	// generate a signed json web token with the contents of user object and return it in the response
	const token = jwt.sign({user: ctx.state.user}, JWTConfig.secret, {
		expiresIn: JWTConfig.expires || '1d' // expires in 1 day
	})
	// even xhr call it will set cookie (axios can set cookie, but not redirect)
	ctx.cookies.set('jwt_token', token, {signed: true, httpOnly: true})
	ctx.redirect('/member') // successRedirect
})


// facebook------------------------------------------------
// login
router.get('/auth/facebook', passport.authenticate('facebook-auth', {scope: ['public_profile', 'email']}))

// callback
router.get('/auth/facebook/callback', passport.authenticate('facebook-auth', {
	failureRedirect: '/login'
}), async (ctx) => {
	// generate a signed json web token with the contents of user object and return it in the response
	const token = jwt.sign({user: ctx.state.user}, JWTConfig.secret, {
		expiresIn: JWTConfig.expires || '1d' // expires in 1 day
	})
	ctx.cookies.set('jwt_token', token, {signed: true, httpOnly: true})
	ctx.redirect('/member') // successRedirect
})


////////////////////////////////////////////////////////////
//                CONNECT (Link / Unlink)                 //
////////////////////////////////////////////////////////////

// local-----------------------------------------------
// login
router.post('/connect/login', passport.authenticate('local-login', {
	successRedirect: '/member',
	failureRedirect: '/connect/login'
}))

// signup
router.post('/connect/signup', passport.authenticate('local-signup', {
	successRedirect: '/member',
	failureRedirect: '/connect/signup'
}))

// facebook------------------------------------------------
// login
router.get('/connect/facebook', async (ctx) => {
	if (ctx.isAuthenticated())
		return passport.authenticate('facebook-connect', {scope: ['public_profile', 'email']})(ctx)
	else ctx.redirect('/')
})
// callback
router.get('/connect/facebook/callback', passport.authenticate('facebook-connect', {
	successRedirect: '/member',
	failureRedirect: '/connect/login'
}))

// unlink--------------------------------------------------
router.get('/unlink/:id', RBAC.auth(), RBAC.middleware('identities:unlink'), async (ctx) => {
	// can only get the identity if you are the identity's user's owner
	const identity = await Identity.findById(ctx.params.id).exec()
	if (identity) {
		const user = await User.findById(identity.user).select({owners: 1}).exec()
		if (user) {
			if (await RBAC.check(ctx.state.user, 'identities:unlink', user.owners)) {
				await identity.unlink()
			}
		}
	}
	ctx.redirect('/member')
})


////////////////////////////////////////////////////////////
//                         Pages                          //
////////////////////////////////////////////////////////////

// index page
router.get('/', async (ctx) => {
	if (ctx.isUnauthenticated()) {
		await ctx.render('index')
	} else {
		ctx.redirect('/member')
	}
})

// login page
router.get('/login', async (ctx) => {
	if (ctx.isUnauthenticated()) {
		await ctx.render('login')
	} else {
		ctx.redirect('/member')
	}
})

// signup page
router.get('/signup', async (ctx) => {
	if (ctx.isUnauthenticated()) {
		await ctx.render('signup')
	} else {
		ctx.redirect('/member')
	}
})

// connect login page
router.get('/connect/login', async (ctx) => {
	if (ctx.isAuthenticated()) {
		await ctx.render('connect_login')
	} else {
		ctx.redirect('/')
	}
})

// connect signup page
router.get('/connect/signup', async (ctx) => {
	if (ctx.isAuthenticated()) {
		await ctx.render('connect_signup')
	} else {
		ctx.redirect('/')
	}
})

// member page
router.get('/member', async (ctx) => {
	if (ctx.isAuthenticated()) {
		const user = await User.findById(ctx.state.user).populate('identities').exec()
		await ctx.render('member', {identities: user.identities})
	} else {
		ctx.redirect('/')
	}
})

// logout
router.get('/logout', async (ctx) => {
	if (ctx.isAuthenticated()) {
		ctx.logout()
	}
	ctx.redirect('/')
})

module.exports = router