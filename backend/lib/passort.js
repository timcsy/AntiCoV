const passport = require('koa-passport')

const ExtractJwt = require('passport-jwt').ExtractJwt
const JwtStrategy = require('passport-jwt').Strategy
const JWTConfig = require('../config/jwt')

const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const FacebookStrategy = require('passport-facebook').Strategy
const FacebookTokenStrategy = require('passport-facebook-token')
const FacebookConfig = require('../config/facebook')

const User = require('../models/Auth/User')
const Local = require('../models/Auth/Local')
const Facebook = require('../models/Auth/Facebook')
const RBAC = require('./rbac')

//-----------------------------------------------------
// session --------------------------------------------
//-----------------------------------------------------
// on login
passport.serializeUser((user, done) => {
	done(null, user)
})

// read from session
passport.deserializeUser(async (user, done) => {
	done(null, user)
})

//-----------------------------------------------------
// jwt ------------------------------------------------
//-----------------------------------------------------
passport.use('jwt', new JwtStrategy({
	jwtFromRequest: ExtractJwt.fromExtractors([
		ExtractJwt.fromAuthHeaderAsBearerToken(),
		ExtractJwt.fromAuthHeaderWithScheme('JWT'),
		ExtractJwt.fromUrlQueryParameter('token'),
		ExtractJwt.fromBodyField('token')
	]),
	secretOrKey: JWTConfig.secret // the key should be saved in config, same with the key in api
}, async (jwt_payload, done) => {
	if (jwt_payload.user) {
		const user = await User.findById(jwt_payload.user).exec()
		if (user) done(null, jwt_payload.user)
		else done(null, false)
	} else done(null, false)
}))

//-----------------------------------------------------
// local ----------------------------------------------
//-----------------------------------------------------
passport.use('local-login', new LocalStrategy({
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
}, async (req, username, password, done) => {
	try {
		if (username === '') return done(null, false) // guest account
		const identity = await Local.findOne({username: username}).exec()
		if (!identity) return done(null, false) // user deosn't exist
		const cmp = await bcrypt.compare(password, identity.password)
		if (cmp === false) return done(null, false) // wrong password

		if (req.user && !(await User.guest()).equals(req.user)) { // req.user is ctx.state.user
			await User.link(req.user, identity.user._id)
			done(null, req.user)
		} else {
			done(null, identity.user._id)
		}
	} catch (err) {
		return done(err, false)
	}
}))

passport.use('local-signup', new LocalStrategy({
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
}, async (req, username, password, done) => {
	try {
		let identity = await Local.findOne({username: username}).exec()
		if (identity) return done(null, false) // username is already taken
		const hash = await bcrypt.hash(password, 12)
		identity = new Local({username: username, password: hash})
		
		const guest = await User.guest()
		if (!req.user || guest.equals(req.user)) { // if DNE then add user
			const user = await User.create()
			RBAC.addUserRoles(user._id, 'member')
			identity.user = user
		}
		await identity.save()
		if(req.user && !guest.equals(req.user)) {
			await User.link(req.user, identity.user._id)
			return done(null, req.user)
		}	else return done(null, identity.user._id)
	} catch (err) {
		return done(err, false)
	}
}))

//-----------------------------------------------------
// facebook -------------------------------------------
//-----------------------------------------------------
async function facebook(req, accessToken, refreshToken, profile, cb) {
	try {
		let identity = await Facebook.findOne({id: profile.id, type: 'facebook'}).exec()
		
		if (!identity) {
			identity = new Facebook()
			const user = await User.create()
			RBAC.addUserRoles(user._id, 'member')
			identity.user = user
		}
		identity.id = profile.id
		identity.name = profile.displayName
		identity.email = profile.emails[0].value
		identity.picture = profile.photos[0].value
		identity.accessToken = accessToken

		await identity.save()

		const guest = await User.guest()
		if (req.user && !guest.equals(req.user)) await User.link(req.user, identity.user._id)
		if (req.user && !guest.equals(req.user)) return cb(null, req.user)
		else return cb(null, identity.user._id)
	} catch (err) {
		return cb(err, false)
	}
}

passport.use('facebook-auth', new FacebookStrategy({
	clientID: FacebookConfig.FACEBOOK_APP_ID,
	clientSecret: FacebookConfig.FACEBOOK_APP_SECRET,
	callbackURL: FacebookConfig.AUTH_callbackURL,
	profileFields: ['id', 'displayName', 'photos', 'email'],
	passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
}, facebook))

passport.use('facebook-connect', new FacebookStrategy({
	clientID: FacebookConfig.FACEBOOK_APP_ID,
	clientSecret: FacebookConfig.FACEBOOK_APP_SECRET,
	callbackURL: FacebookConfig.CONNECT_callbackURL,
	profileFields: ['id', 'displayName', 'photos', 'email'],
	passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
}, facebook))

passport.use('facebook-token', new FacebookTokenStrategy({
	clientID: FacebookConfig.FACEBOOK_APP_ID,
	clientSecret: FacebookConfig.FACEBOOK_APP_SECRET,
	profileFields: ['id', 'displayName', 'photos', 'email'],
	passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
}, facebook))

module.exports = passport