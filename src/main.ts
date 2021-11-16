import dotenv from 'dotenv';
dotenv.config();
import logger from './logger';

import createServer from './server';

const port = process.env.PORT || 3000;

(async () => {
  try {
    const app = createServer();
    app.listen(port, () => {
      logger.info(`Puppeteer Server has started! Listening on ${port}`);
    });
  } catch (error) {
    logger.error(
      `Error starting server: ${error instanceof Error ? error.message : '-'}`,
    );
  }
})();
