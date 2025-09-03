import morgan from 'morgan';

export const httpLogger = morgan(':method :url :status - :response-time ms');
export const log = {
  info: (...a) => console.log('[INFO]', ...a),
  error: (...a) => console.error('[ERROR]', ...a),
};
