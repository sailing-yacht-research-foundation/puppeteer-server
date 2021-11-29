import express from 'express';

import externalPlatformController from '../../controllers/v1/externalPlatform.controller';

const router = express.Router();

router.post('/add-credentials', externalPlatformController.addCredentials);
router.post('/get-events', externalPlatformController.getEvents);
router.post('/import-event-data', externalPlatformController.importEventData);

export default router;
