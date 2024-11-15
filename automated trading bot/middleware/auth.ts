import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import { Request, Response, NextFunction } from 'express'

export interface AuthenticatedRequest extends Request {
  user?: { _id: string; [key: string]: any }
}

const auth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization
  const secretKey = process.env.JWT_SECRET

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Access denied. Token not provided' })
    return
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, secretKey as string) as {
      _id: string
      email: string
    }

    req.user = decoded
    next()
  } catch (error) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Invalid token', error })
    return
  }
}

export { auth }
