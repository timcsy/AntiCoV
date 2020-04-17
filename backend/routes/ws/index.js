const Router = require('koa-router')
const RBAC = require('../../lib/rbac')
const service = require('../../services/api.js')

const sockets = [] // to store the incoming socket

const router = new Router()

router.all('/data', RBAC.auth(), async (ctx) => {
	console.log(ctx.state.user)
	sockets.push(ctx.websocket)
	ctx.websocket.on('open', function() {
		
	})
	ctx.websocket.on('message', async function(message) {
		// do something with the message from client
		const msg = JSON.parse(message)
		console.log(ctx.state.user + message)
		if (msg.cmd === 'temperature') {
			send(await service.setTemperature(msg.temperature))
		}
	})
})

function send(msg) {
	for (const key in sockets) {
		console.log(msg)
		sockets[key].send(JSON.stringify(msg))
	}
}

module.exports = {
	router,
	send
}