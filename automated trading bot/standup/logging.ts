import winston from 'winston'
import 'express-async-errors'

// export function logging() {
//   winston.exceptions.handle(
//     new winston.transports.Console({
//       format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.prettyPrint()
//       ),
//     }),
//     new winston.transports.File({ filename: 'uncaughtExceptions.log' })
//   )

//   process.on('unhandledRejection', (ex) => {
//     throw ex
//   })

//   winston.add(new winston.transports.File({ filename: 'logfile.log' }))
// }

export function logging() {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.prettyPrint()
    ),
    transports: [
      new winston.transports.File({ filename: 'logfile.log' }),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.prettyPrint()
        ),
      }),
    ],
    exceptionHandlers: [
      new winston.transports.File({ filename: 'uncaughtExceptions.log' }),
    ],
  })

  process.on('unhandledRejection', (ex) => {
    logger.error(ex)
    throw ex
  })

  return logger
}
