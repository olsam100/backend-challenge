import { Response } from 'express'
import { Strategy, validateStrategy } from '../models/strategy'
import { StatusCodes } from 'http-status-codes'
import { AuthenticatedRequest } from '../middleware/auth'

//getting all strategies
const getStrategies = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { _id: userId } = req.user!

  const strategies = await Strategy.find({ user: userId })

  if (strategies.length === 0) {
    res.status(StatusCodes.OK).json({
      message: 'No strategy created yet',
    })
    return
  }

  res.status(StatusCodes.OK).json({
    strategies,
    message: 'User strategies retrieved successfully',
  })
}

//creating a new strategy
const createStrategy = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { _id: userId } = req.user!
  const { name, indicators, conditions } = req.body

  const { error } = validateStrategy(req.body)
  if (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: error.details[0].message })

    return
  }

  const strategy = new Strategy({ name, indicators, conditions, user: userId })

  await strategy.save()
  res.status(StatusCodes.CREATED).json({
    strategy: {
      name: strategy.name,
      indicators: strategy.indicators,
      conditions: strategy.conditions,
    },
    message: 'New strategy created successfully',
  })
}

const updateStrategy = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params
  const { _id: userId } = req.user!

  const strategy = await Strategy.findOne({ _id: id, user: userId })
  if (!strategy) {
    res.status(StatusCodes.NOT_FOUND).json({
      message: `Strategy with id ${id} cannot be found or you are not the owner`,
    })

    return
  }

  const updatedStrategy = await Strategy.findByIdAndUpdate(
    id,
    { ...req.body },
    { new: true }
  )

  res
    .status(StatusCodes.OK)
    .json({ updatedStrategy, message: 'Trading strategy updated successfully' })
}

const deleteStrategy = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params
  const { _id: userId } = req.user!

  const strategy = await Strategy.findOneAndDelete({ _id: id, user: userId })
  if (!strategy) {
    res.status(StatusCodes.NOT_FOUND).json({
      message: `Strategy with id ${id} cannot be found or you are not the owner`,
    })
    return
  }

  res.status(StatusCodes.OK).json({
    message: 'Strategy deleted successfully',
  })
}

export { getStrategies, createStrategy, updateStrategy, deleteStrategy }
