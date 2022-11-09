// mongodb
import './config/db.js'
import express from 'express'
const app = express()
const port = 3000

import router from './api/User.js'

// For accepting post form data
import bodyParser from 'body-parser'

app.use(bodyParser.json())

app.use('/user', router)

app.listen(port, () => {
	console.log(`Server running on port ${port}`)
})
