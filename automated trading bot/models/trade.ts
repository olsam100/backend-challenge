import mongoose, { Schema, model, Document } from 'mongoose'
import Joi from 'joi'

interface ITrade extends Document {
  user: mongoose.Types.ObjectId
  strategy?: mongoose.Types.ObjectId
  type: 'buy' | 'sell'
  entryPoint: number
  exitPoint?: number
  amount: number
  profitOrLoss: number
  tradeDate: Date
  status: 'open' | 'closed'
  automated: boolean
}

const tradeSchema = new Schema<ITrade>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    strategy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Strategy',
    },
    type: {
      type: String,
      enum: ['buy', 'sell'],
      required: true,
    },
    entryPoint: {
      type: Number,
      required: true,
    },
    exitPoint: {
      type: Number,
    },
    amount: {
      type: Number,
      required: true,
    },
    profitOrLoss: {
      type: Number,
      default: 0,
    },
    tradeDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    automated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

const validate = (trade: Partial<ITrade>) => {
  const tradeValidationSchema = Joi.object({
    type: Joi.string().valid('buy', 'sell').required(),
    entryPoint: Joi.number().required(),
    amount: Joi.number().required(),
    automated: Joi.boolean(),
    strategy: Joi.string().optional(),
  })

  return tradeValidationSchema.validate(trade)
}

const Trade = model<ITrade>('Trade', tradeSchema)

export { Trade, validate }
