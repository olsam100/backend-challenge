import express from 'express'
import {
  createStrategy,
  updateStrategy,
  deleteStrategy,
  getStrategies,
} from '../controllers/strategies'
const router = express.Router()

router.get('/', getStrategies)
router.post('/', createStrategy)
router.put('/:id', updateStrategy)
router.delete('/:id', deleteStrategy)

export default router
