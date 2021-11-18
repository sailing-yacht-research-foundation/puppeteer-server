import express from 'express';

import credentialsController from '../../controllers/v1/credentials.controller';

const router = express.Router();

router.post('/test-credentials', credentialsController.addCredentials);

export default router;
