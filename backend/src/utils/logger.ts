import { createLogger, transports, format } from 'winston';
import path from 'path';

// Create logger with winston
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({
      stack: true
    }),
    format.splat(),
    format.json()
  ),
  defaultMeta: {
    service: 'portfolio-api'
  },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    // Write all logs with level `info` and below to `combined.log`
    new transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// If we're not in production, log to the console with format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

// Export logger
export default logger;
