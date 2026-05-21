import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: config.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    config.NODE_ENV === 'development' ? colorize() : winston.format.uncolorize(),
    logFormat
  ),
  transports: [new winston.transports.Console()],
});
