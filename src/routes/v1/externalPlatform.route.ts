import express from 'express';

import extrernalPlatformController from '../../controllers/v1/externalPlatform.controller';

const router = express.Router();

router.post('/add-credentials', extrernalPlatformController.addCredentials);

export default router;
