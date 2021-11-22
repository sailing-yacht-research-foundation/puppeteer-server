import express from 'express';

import generalRoutes from './routes/general.route';
import v1ExternalPlatformRoutes from './routes/v1/externalPlatform.route';

export default function createServer() {
  const app = express();
  app.use(express.json());

  app.use('/', generalRoutes);
  app.use('/v1/external-platform', v1ExternalPlatformRoutes);

  return app;
}
