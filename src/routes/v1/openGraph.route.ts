import express from 'express';

import openGraphController from '../../controllers/v1/openGraph.controller';

const router = express.Router();

router.post('/generate-event-graph', openGraphController.generateEvent);
router.post(
  '/generate-competition-graph',
  openGraphController.generateCompetition,
);

export default router;
