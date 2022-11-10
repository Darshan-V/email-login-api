// mongodb
import './config/db.js'
import express from 'express'
const app = express()
import cors from 'cors'
import bodyParser from 'body-parser'

import routes from './routes/index.js'
app.use(cors())
app.use(bodyParser.json())

app.use(routes)
export default app
