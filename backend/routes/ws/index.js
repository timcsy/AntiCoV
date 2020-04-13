const Router = require('koa-router')
const RBAC = require('../../lib/rbac')

const sockets = {} // to store the incoming socket

const router = new Router()

router.all('/data', RBAC.auth(), async (ctx) => {
	console.log(ctx.state.user)
	sockets[ctx.state.user] = ctx.websocket
	const ws_self = sockets[ctx.state.user]
	ctx.websocket.on('open', function() {
		
	})
	ctx.websocket.on('message', async function(message) {
		// do something with the message from client
		const msg = JSON.parse(message)
		console.log(ctx.state.user + message)
		ws_self.send(JSON.stringify({ on: 'session:start', data: 'some data' }))
		ws.send(JSON.stringify({on: 'session:ready', data: 'some data'}))
	})
})

module.exports = router