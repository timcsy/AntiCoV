require('dotenv').config()
const Koa = require('koa')
const cors = require('@koa/cors')
const session = require('koa-session')
const bodyParser = require('koa-bodyparser')
const websockify = require('koa-websocket')
const passport = require('./lib/passort')
const router = require('./routes')
const wsRouter = require('./routes/ws').router
const static = require('koa-static')
const path = require('path')
const config = require('./config/server')

const app = websockify(new Koa())
app.use(cors())

// sessions
app.keys = config.SESSION_KEYS
app.use(session(app))

// body parser
app.use(bodyParser())

// auth
app.use(passport.initialize())
app.use(passport.session())

// static routes
app.use(static(path.resolve(__dirname, './static')))

// Websocket routes
app.ws.use(session(app))
app.ws.use(passport.initialize())
app.ws.use(passport.session())
app.ws.use(wsRouter.routes())

// routes
app.use(router.routes())

// server
app.listen(config.PORT, () => {
	console.log(`Remember to open MongoDB server`)
	console.log(`Remember to setup at first time: npm run setup`)
	console.log(`Server is running at http://localhost:${config.PORT}`)
})