const Router = require('koa-router')
// auth
const userRouter = require('../auth/user')
const identityRouter = require('../auth/identity')
const groupRouter = require('../auth/group')
const roleRouter = require('../auth/role')
// data
const dataRouter = require('../api/data')
// AntiCoV
const anticovRouter = require('../api/anticov')

const router = new Router({prefix: '/api/v1'})

// User resource
router.use(userRouter.routes())

// Identity resource
router.use(identityRouter.routes())

// Group resource
router.use(groupRouter.routes())

// Role resource
router.use(roleRouter.routes())

// Data resource
router.use(dataRouter.routes())

// AntiCoV resources
router.use(anticovRouter.routes())

module.exports = router