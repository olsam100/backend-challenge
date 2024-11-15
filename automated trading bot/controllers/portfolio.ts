import { Response } from 'express'
import { Portfolio, validateAsset } from '../models/portfolio'
import { StatusCodes } from 'http-status-codes'
import { AuthenticatedRequest } from '../middleware/auth'

const getPortfolio = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { _id: userId } = req.user!

  const portfolio = await Portfolio.findOne({ user: userId })
  if (!portfolio || portfolio.assets.length === 0) {
    res
      .status(StatusCodes.OK)
      .json({ message: 'No assets in the portfolio yet.' })
    return
  }

  res.status(StatusCodes.OK).json({
    message: 'Portfolio information fetched successfully',
    portfolio,
  })
}

const calculateNewAveragePrice = (
  currentQuantity: number,
  currentAvgPrice: number,
  additionalQuantity: number,
  additionalPrice: number
) => {
  const totalCost =
    currentQuantity * currentAvgPrice + additionalQuantity * additionalPrice
  const newQuantity = currentQuantity + additionalQuantity
  return totalCost / newQuantity
}

const createAsset = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { _id: userId } = req.user!
  const { type, symbol, exchange, quantity, averagePurchasePrice } = req.body

  const { error } = validateAsset(req.body)
  if (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: error.details[0].message })
    return
  }

  let portfolio = await Portfolio.findOne({ user: userId })

  if (!portfolio) {
    portfolio = new Portfolio({ user: userId, assets: [], transactions: [] })
  }

  const existingAsset = portfolio.assets.find(
    (asset) =>
      asset.type === type &&
      asset.symbol === symbol &&
      asset.exchange === exchange
  )

  if (existingAsset) {
    existingAsset.quantity += quantity
    existingAsset.averagePurchasePrice = calculateNewAveragePrice(
      existingAsset.quantity - quantity,
      existingAsset.averagePurchasePrice,
      quantity,
      averagePurchasePrice
    )

    if (existingAsset.currentPrice) {
      existingAsset.unrealizedGainLoss =
        (existingAsset.currentPrice - existingAsset.averagePurchasePrice) *
        existingAsset.quantity
    }
  } else {
    portfolio.assets.push({
      type,
      symbol,
      exchange,
      quantity,
      averagePurchasePrice,
      unrealizedGainLoss: 0,
      realizedGainLoss: 0,
      createdAt: new Date(),
    })
  }

  portfolio.totalValue = portfolio.assets.reduce((sum, asset) => {
    return (
      sum + (asset.currentPrice || asset.averagePurchasePrice) * asset.quantity
    )
  }, 0)

  portfolio.totalUnrealizedGainLoss = portfolio.assets.reduce((sum, asset) => {
    return sum + (asset.unrealizedGainLoss || 0)
  }, 0)

  await portfolio.save()

  res
    .status(StatusCodes.OK)
    .json({ message: 'Asset created/updated successfully', portfolio })
}

const deleteAsset = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { _id: userId } = req.user!
  const { symbol, type, exchange } = req.params

  const portfolio = await Portfolio.findOne({ user: userId })
  if (!portfolio) {
    res.status(StatusCodes.NOT_FOUND).json({ error: 'Portfolio not found' })
    return
  }

  const assetIndex = portfolio.assets.findIndex(
    (asset) =>
      asset.symbol === symbol &&
      asset.type === type &&
      asset.exchange === exchange
  )

  if (assetIndex === -1) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ error: 'Asset not found in the portfolio' })
    return
  }

  portfolio.assets.splice(assetIndex, 1)

  portfolio.totalValue = portfolio.assets.reduce((sum, asset) => {
    return (
      sum + (asset.currentPrice || asset.averagePurchasePrice) * asset.quantity
    )
  }, 0)

  portfolio.totalUnrealizedGainLoss = portfolio.assets.reduce((sum, asset) => {
    return sum + (asset.unrealizedGainLoss || 0)
  }, 0)

  await portfolio.save()

  res.status(StatusCodes.OK).json({
    message: 'Asset deleted successfully.',
    portfolio,
  })
}

export { getPortfolio, createAsset, deleteAsset }
