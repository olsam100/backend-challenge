import { Response } from 'express'
import { Trade, validate } from '../models/trade'
import { StatusCodes } from 'http-status-codes'
import { AuthenticatedRequest } from '../middleware/auth'

const placeTrade = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { _id: userId } = req.user!
  const { type, entryPoint, amount, automated, strategy } = req.body

  const { error } = validate(req.body)
  if (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: error.details[0].message })
    return
  }

  const trade = new Trade({
    user: userId,
    type,
    entryPoint,
    amount,
    automated: !!automated,
    strategy: strategy || null,
  })

  await trade.save()
  res
    .status(StatusCodes.CREATED)
    .json({ trade, message: 'Trade executed successfully' })
}

const getTradeHistory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { _id: userId } = req.user!

  const trades = await Trade.find({ user: userId }).sort({ tradeDate: -1 })

  if (trades.length === 0) {
    res
      .status(StatusCodes.OK)
      .json({ message: 'No trades have been executed yet' })
    return
  }

  res
    .status(StatusCodes.OK)
    .json({ message: 'Trade history fetched successfully', trades })
}

export { placeTrade, getTradeHistory }
