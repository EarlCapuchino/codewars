const config = require('../config');

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = config.nodeEnv === 'production' ? LogLevel.INFO : LogLevel.DEBUG;

function formatMessage(level, context, message, data) {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level}] [${context}] ${message}`;
  if (data !== undefined) {
    return `${base} ${JSON.stringify(data, null, 2)}`;
  }
  return base;
}

const logger = {
  debug(context, message, data) {
    if (currentLevel <= LogLevel.DEBUG) {
      console.debug(formatMessage('DEBUG', context, message, data));
    }
  },
  info(context, message, data) {
    if (currentLevel <= LogLevel.INFO) {
      console.info(formatMessage('INFO', context, message, data));
    }
  },
  warn(context, message, data) {
    if (currentLevel <= LogLevel.WARN) {
      console.warn(formatMessage('WARN', context, message, data));
    }
  },
  error(context, message, data) {
    if (currentLevel <= LogLevel.ERROR) {
      console.error(formatMessage('ERROR', context, message, data));
    }
  },
};

module.exports = logger;
