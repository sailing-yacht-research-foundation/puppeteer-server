import * as dotenv from 'dotenv';
dotenv.config();

import createServer from './server';
import { connect as redisConnect } from './redis';
import db from './models';
import logger from './logger';
import { registerBGWorkers } from './jobs';
// import * as ogJob from './jobs/openGraph';

const port = process.env.PORT || 3000;

(async () => {
  try {
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
      // setTimeout(() => {
      //   ogJob.addEvent({
      //     id: 'test',
      //     position: [108.6328125, -5.615985819155327],
      //   });
      // }, 5000);
    });
  } catch (error) {
    logger.error(
      `Error starting server: ${error instanceof Error ? error.message : '-'}`,
    );
  }
})();
