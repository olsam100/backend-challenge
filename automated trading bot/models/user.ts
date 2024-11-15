import { Document, Schema, model, CallbackError } from 'mongoose'
import Joi from 'joi'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

interface IUser extends Document {
  email: string
  password: string
  isVerified: boolean
  verificationToken?: string
  generateUserToken: () => string
  mfaSecret?: string
  isMfaEnabled: boolean
  mfaCodeExpiry?: number
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    trim: true,
    minlength: 5,
    maxlength: 255,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  mfaSecret: {
    type: String,
  },
  isMfaEnabled: {
    type: Boolean,
    default: false,
  },
})

const validate = (user: { email: string; password: string }) => {
  const schema = Joi.object({
    email: Joi.string().email().trim().required(),
    password: Joi.string().trim().min(5).max(255).required(),
  })

  return schema.validate(user)
}

userSchema.methods.generateUserToken = function () {
  const secretKey = process.env.JWT_SECRET

  const token = jwt.sign(
    { email: this.email, _id: this._id },
    secretKey as string,
    { expiresIn: '1h' }
  )
  return token
}

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(12)
      this.password = await bcrypt.hash(this.password, salt)
      next()
    } catch (error) {
      next(error as CallbackError)
    }
  }
  next()
})

const User = model('User', userSchema)

export { User, validate }
