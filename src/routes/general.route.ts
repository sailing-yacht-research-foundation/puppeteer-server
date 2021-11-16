import express from 'express';

import mainController from '../controllers/mainController';

const router = express.Router();

router.get('/', mainController.landing);
router.get('/health', mainController.healthCheck);

export default router;
