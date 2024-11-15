import express from 'express'
import cors from 'cors'
import { auth } from '../middleware/auth'
import users from '../routes/users'
import portfolio from '../routes/portfolios'
import strategies from '../routes/strategies'
import trades from '../routes/trades'

const routes = (app: express.Application) => {
  app.use(express.json())
  app.use(cors())

  app.use('/user', users)
  app.use('/portfolio', auth, portfolio)
  app.use('/strategies', auth, strategies)
  app.use('/trades', auth, trades)
}

export default routes
