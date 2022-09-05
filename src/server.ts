import express from 'express';
import cors from 'cors';

import basicAuth from './middleware/basicAuth';
import errorHandler from './middleware/errorHandler';

import generalRoutes from './routes/general.route';
import v1ExternalPlatformRoutes from './routes/v1/externalPlatform.route';
import v1OpenGraphRoutes from './routes/v1/openGraph.route';

export default function createServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  app.use('/', generalRoutes);
  app.use(basicAuth);
  app.use('/v1/external-platform', v1ExternalPlatformRoutes);
  app.use('/v1/open-graph', v1OpenGraphRoutes);

  // global error handler
  app.use(errorHandler);
  return app;
}
