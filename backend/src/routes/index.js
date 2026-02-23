const { Router } = require('express');
const v1Routes = require('./v1/gameRoutes');

const router = Router();

router.use('/v1', v1Routes);

router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

module.exports = router;
