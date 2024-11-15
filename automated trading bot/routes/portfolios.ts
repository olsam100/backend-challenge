import express from 'express'
import {
  getPortfolio,
  createAsset,
  deleteAsset,
} from '../controllers/portfolio'
const router = express.Router()

router.get('/', getPortfolio)
router.post('/assets', createAsset)
router.delete('/:id', deleteAsset)

export default router
