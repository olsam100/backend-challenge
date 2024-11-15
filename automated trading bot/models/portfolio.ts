import mongoose, { Schema, model } from 'mongoose'
import Joi from 'joi'

interface Asset {
  type: string
  symbol: string
  exchange?: string
  quantity: number
  averagePurchasePrice: number
  currentPrice?: number
  unrealizedGainLoss?: number
  realizedGainLoss?: number
  createdAt?: Date
}

interface Transaction {
  assetSymbol: string
  quantity: number
  price: number
  transactionType: 'buy' | 'sell'
  createdAt: Date
}

const assetSchema = new Schema<Asset>(
  {
    type: { type: String, required: true },
    symbol: { type: String, required: true },
    exchange: { type: String },
    quantity: { type: Number, required: true },
    averagePurchasePrice: { type: Number, required: true },
    currentPrice: { type: Number },
    unrealizedGainLoss: { type: Number, default: 0 },
    realizedGainLoss: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const transactionSchema = new Schema(
  {
    assetSymbol: { type: String, required: true },
    assetType: { type: String, required: true },
    assetExchange: { type: String, required: true },
    action: { type: String, required: true },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    transactionDate: { type: Date, default: Date.now },
  },
  { _id: false }
)

const portfolioSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assets: [assetSchema],
    transactions: [transactionSchema],
    cashBalance: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
    totalUnrealizedGainLoss: { type: Number, default: 0 },
    totalRealizedGainLoss: { type: Number, default: 0 },
    totalReturn: { type: Number, default: 0 },
    annualizedReturn: { type: Number, default: 0 },
    volatility: { type: Number, default: 0 },
    sharpeRatio: { type: Number, default: 0 },
    maximumDrawdown: { type: Number, default: 0 },
  },
  { timestamps: true }
)

portfolioSchema.index(
  { user: 1, 'assets.type': 1, 'assets.symbol': 1, 'assets.exchange': 1 },
  { unique: true }
)

const validateAsset = (asset: Asset) => {
  const schema = Joi.object({
    type: Joi.string().required(),
    symbol: Joi.string().required(),
    exchange: Joi.string(),
    quantity: Joi.number().required(),
    averagePurchasePrice: Joi.number().required(),
  })
  return schema.validate(asset)
}

const Portfolio = model('Portfolio', portfolioSchema)
const Transaction = model('Transaction', transactionSchema)

export { Portfolio, Transaction, validateAsset }
