const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl, body } = req;

  logger.info('HTTP', `→ ${method} ${originalUrl}`, body && Object.keys(body).length > 0 ? body : undefined);

  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const duration = Date.now() - start;
    logger.info('HTTP', `← ${method} ${originalUrl} [${res.statusCode}] ${duration}ms`, data);
    return originalJson(data);
  };

  next();
}

module.exports = requestLogger;
