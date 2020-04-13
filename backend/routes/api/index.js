const Router = require('koa-router')
// auth
const userRouter = require('../auth/user')
const identityRouter = require('../auth/identity')
const groupRouter = require('../auth/group')
const roleRouter = require('../auth/role')
// data
const dataRouter = require('../api/data')

const router = new Router({prefix: '/api'})

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

module.exports = router