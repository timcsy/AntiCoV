const Router = require('koa-router')
const RBAC = require('../../lib/rbac.js')
const service = require('../../services/api.js')

const router = new Router()

// 溫度區間（當天）
router.get('/temperature', RBAC.auth(true), async (ctx) => {
	ctx.body = await service.getTemperature(ctx)
})

// 表格資料
router.get('/table', RBAC.auth(true), async (ctx) => {
	ctx.body = await service.table(ctx)
})

// 資料統整
router.get('/statistics', RBAC.auth(true), async (ctx) => {
	ctx.body = await service.statistics(ctx)
})

// 查詢(特定ID狀況)
router.get('/people/:studentId', RBAC.auth(), RBAC.middleware('people:get'), async (ctx) => {
	ctx.body = await service.search(ctx, ctx.params.studentId)
})

// 人像偵測
router.post('/pass', RBAC.auth(true), async (ctx) => {
	ctx.body = await service.pass(ctx, ctx.request.body.status, ctx.request.body.number)
	ctx.status = 201
})

// 逼卡
router.post('/temperature', RBAC.auth(true), RBAC.middleware('people:post'), async (ctx) => {
	ctx.body = await service.pass(ctx, ctx.request.body.rfid)
	ctx.status = 201
})

// 逼卡註冊
router.post('/people', RBAC.auth(true), RBAC.middleware('people:post'), async (ctx) => {
	ctx.body = await service.pass(ctx, ctx.request.body.rfid, ctx.request.body.studentId, ctx.request.body.name)
	ctx.status = 201
})


module.exports = router