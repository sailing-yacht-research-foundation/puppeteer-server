import * as dotenv from 'dotenv';
dotenv.config();

import createServer from './server';
import { connect as redisConnect } from './redis';
import db from './models';
import logger from './logger';
import { registerBGWorkers } from './jobs';

const port = process.env.PORT || 3000;

(async () => {
  try {
    if (!process.env.CRYPTO_INTERNAL_AES_GCM_KEY) {
      throw new Error(
        'Unable to start service, need CRYPTO_INTERNAL_AES_GCM_KEY setup',
      );
    }
    const app = createServer();
    await Promise.all([db.startDB(), redisConnect()]);

    setImmediate(async () => {
      try {
        await registerBGWorkers();
      } catch (error) {
        logger.error(
          `Setup BG Workers Failed:  ${
            error instanceof Error ? error.message : '-'
          }`,
        );
      }
    });
    app.listen(port, () => {
      logger.info(`Puppeteer Server has started! Listening on ${port}`);
    });
  } catch (error) {
    logger.error(
      `Error starting server: ${error instanceof Error ? error.message : '-'}`,
    );
  }
})();
