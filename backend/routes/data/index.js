const Router = require('koa-router')
const RBAC = require('../../lib/rbac')

const router = new Router()

router.get('/data', RBAC.auth(true), async (ctx) => {
	await ctx.render('data/index')
})

module.exports = router