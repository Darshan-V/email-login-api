import express from 'express'
const router = express.Router()

import userRoutes from './../domains/user/index.js'
// import userRouter from './../domains/user/'

router.use('/user', userRoutes)

export default router
