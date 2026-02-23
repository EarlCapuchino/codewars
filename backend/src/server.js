const config = require('./config');
const app = require('./app');
const logger = require('./utils/logger');

const CTX = 'Server';

app.listen(config.port, () => {
  logger.info(CTX, `CodeWords API running on port ${config.port}`);
  logger.info(CTX, `Environment: ${config.nodeEnv}`);
  logger.info(CTX, `API base: http://localhost:${config.port}/api/v1`);
});
