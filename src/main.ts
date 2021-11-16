import dotenv from 'dotenv';
dotenv.config();
import createServer from './server';
import db from './models';
import logger from './logger';

const port = process.env.PORT || 3000;

(async () => {
  try {
    const app = createServer();
    await db.startDB();
    app.listen(port, () => {
      logger.info(`Puppeteer Server has started! Listening on ${port}`);
    });
  } catch (error) {
    logger.error(
      `Error starting server: ${error instanceof Error ? error.message : '-'}`,
    );
  }
})();
