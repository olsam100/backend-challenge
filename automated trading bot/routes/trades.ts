import express from 'express'
import { placeTrade, getTradeHistory } from '../controllers/trade'
const router = express.Router()

router.post('/', placeTrade)
router.get('/history', getTradeHistory)

export default router
