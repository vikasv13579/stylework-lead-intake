import winston from 'winston';
import { config } from './env';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'stylework-backend' },
  transports: [
    new winston.transports.Console({
      format:
        config.NODE_ENV === 'development'
          ? combine(colorize(), simple())
          : combine(timestamp(), json()),
    }),
  ],
});

export default logger;
