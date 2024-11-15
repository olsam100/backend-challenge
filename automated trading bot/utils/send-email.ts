import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env

export const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })

  const mailOptions = {
    from: SMTP_USER,
    to,
    subject,
    text,
  }

  await transporter.sendMail(mailOptions)
}
