import express from 'express';

import generalRoutes from './routes/general.route';
import v1CredentialRoutes from './routes/v1/credentials.route';

export default function createServer() {
  const app = express();
  app.use(express.json());

  app.use('/', generalRoutes);
  app.use('/v1/credentials', v1CredentialRoutes);

  return app;
}
