import mongoose from 'mongoose'
import winston from 'winston'

export const connectDB = async (url: string) => {
  try {
    const connect = await mongoose.connect(url)
    winston.info('App connected to the database')
    return connect
  } catch (error) {
    winston.error('unable to connect to the database', error)
  }
}
