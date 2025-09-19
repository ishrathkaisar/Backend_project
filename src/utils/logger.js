import morgan from 'morgan';
import winston from "winston";

export const httpLogger = morgan(':method :url :status - :response-time ms');
export const log = {
  info: (...a) => console.log('[INFO]', ...a),
  error: (...a) => console.error('[ERROR]', ...a),
};

const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

export default logger;
