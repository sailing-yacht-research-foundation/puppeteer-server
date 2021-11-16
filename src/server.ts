import express from 'express';

import generalRoutes from './routes/general.route';

export default function createServer() {
  const app = express();
  app.use(express.json());

  app.use('/', generalRoutes);

  return app;
}
