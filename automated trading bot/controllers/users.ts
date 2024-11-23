import { Request, Response } from 'express'
// import speakeasy from 'speakeasy'
import { User, validate } from '../models/user'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import { sendEmail } from '../utils/send-email'
import bcrypt from 'bcrypt'
import { AuthenticatedRequest } from '../middleware/auth'
import { port } from '../app'

interface SignupRequest extends Request {
  body: {
    email: string
    password: string
  }
}

interface LoginRequest extends Request {
  body: {
    email: string
    password: string
  }
}

interface MfaRequest extends Request {
  body: {
    email: string
    mfaSecret: string
  }
}

interface UpdateProfileRequest extends AuthenticatedRequest {
  body: {
    email?: string
    password?: string
  }
}

const signup = async (req: SignupRequest, res: Response): Promise<void> => {
  const { error } = validate(req.body)

  if (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: error.details[0].message })
    return
  }

  const { email } = req.body
  const user = await User.findOne({ email })
  if (user) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: 'User already exists' })
    return
  }

  const newUser = new User({ ...req.body })
  const verificationToken = newUser.generateUserToken()
  newUser.verificationToken = verificationToken
  await newUser.save()

  const verificationLink = `http://localhost:${port}/verify/${verificationToken}`
  await sendEmail(
    email,
    'Verify your account',
    ` 
    <div>
    <p>Please click on this link to verify your email</p>
    <a>${verificationLink}</a>
    </div>
    `
  )

  res.status(StatusCodes.CREATED).json({
    message: 'Signup successful. Please check your email for verification',
  })
}

const verifyEmail = async (
  req: Request<{ token: string }>,
  res: Response
): Promise<void> => {
  const { token } = req.params
  const secretKey = process.env.JWT_SECRET as string

  try {
    const decoded = jwt.verify(token, secretKey) as { email: string }

    const user = await User.findOne({
      email: decoded.email,
      verificationToken: token,
    })
    if (!user) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Invalid or expired verification link' })
      return
    }

    user.isVerified = true
    user.verificationToken = undefined
    await user.save()

    res
      .status(StatusCodes.OK)
      .json({ message: 'Account verified successfully' })
  } catch (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'Invalid or expired verification link', error })
  }
}

const login = async (req: LoginRequest, res: Response): Promise<void> => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Invalid email or password' })
    return
  }

  if (user.isMfaEnabled) {
    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString()
    user.mfaSecret = mfaCode
    user.mfaCodeExpiry = Date.now() + 10 * 60 * 1000
    await user.save()

    await sendEmail(user.email, 'Your MFA Code', `Your MFA code is: ${mfaCode}`)

    res
      .status(StatusCodes.OK)
      .json({ mfaRequired: true, message: 'MFA code sent. Please verify.' })
    return
  }

  const token = user.generateUserToken()
  res.status(StatusCodes.OK).json({ message: 'Login successful', token })
}

const verifyMfa = async (req: MfaRequest, res: Response): Promise<void> => {
  const { email, mfaSecret } = req.body

  const user = await User.findOne({ email })
  if (!user || !user.isMfaEnabled || !user.mfaSecret) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'MFA is not enabled or code is invalid' })
    return
  }

  if (
    user.mfaSecret !== mfaSecret ||
    user.mfaCodeExpiry === undefined ||
    user.mfaCodeExpiry < Date.now()
  ) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Invalid or expired MFA code' })
    return
  }

  const token = user.generateUserToken()
  user.mfaSecret = undefined
  user.mfaCodeExpiry = undefined
  await user.save()

  res.status(StatusCodes.OK).json({ message: 'Login successful', token })
}

const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { _id } = req.user!

  const user = await User.findById(_id).select('-password')
  if (!user) {
    res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' })
    return
  }

  res.status(StatusCodes.OK).json({ user, message: 'User profile fetched' })
}

const updateProfile = async (
  req: UpdateProfileRequest,
  res: Response
): Promise<void> => {
  const { _id } = req.user!
  const { email, password } = req.body

  const user = await User.findById(_id)
  if (!user) {
    res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' })
    return
  }

  if (email) {
    user.email = email
  }

  if (password) {
    user.password = password
  }

  await user.save()

  const updatedUser = await User.findById(_id).select('-password')
  res
    .status(StatusCodes.OK)
    .json({ message: 'Profile updated successfully', user: updatedUser })
}

export { signup, verifyEmail, login, verifyMfa, getProfile, updateProfile }
