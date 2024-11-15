import express, { Application } from 'express'
import { swaggerUi, specs } from './swagger'
import dotenv from 'dotenv'
import winston from 'winston'
import { connectDB } from './standup/db'
import routes from './standup/routes'
import { connectionString } from './config/db-string'

const app: Application = express()
dotenv.config()
routes(app)
connectDB(connectionString)

export const port = process.env.PORT || 3000
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
app.listen(port, () => {
  winston.info(`App is listening on port ${port}`)
})
