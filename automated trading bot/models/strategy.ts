import mongoose, { Schema, model } from 'mongoose'
import Joi from 'joi'

interface Strategy {
  name: string
  indicators: string[]
  conditions: string[]
}

const strategySchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    indicators: {
      type: [String],
      required: true,
    },
    conditions: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
)

const validateStrategy = (strategy: Strategy) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    indicators: Joi.array().items(Joi.string().required()).required(),
    conditions: Joi.array().items(Joi.string().required()).required(),
  })
  return schema.validate(strategy)
}

const Strategy = model('Strategy', strategySchema)

export { Strategy, validateStrategy }
