const express = require('express')
const rootRouter = express.Router()
const userRoute = require('./user')




rootRouter.use('/', userRoute)


module.exports = rootRouter