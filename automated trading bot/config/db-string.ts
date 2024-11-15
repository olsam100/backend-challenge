import dotenv from 'dotenv'
dotenv.config()

const { DB_USER, DB_PASS, DB_HOST, DB_NAME } = process.env

export const connectionString = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`
