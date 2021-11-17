import * as dotenv from 'dotenv';
dotenv.config();
import IORedis from 'ioredis';

import createServer from './server';
import {
  connect as redisConnect,
  getBullClient,
  getBullSubscriber,
  newConnection,
} from './redis';
import db from './models';
import logger from './logger';
import { registerWorkers } from './jobs';
import * as ogJob from './jobs/openGraph';

const port = process.env.PORT || 3000;

(async () => {
  try {
    const app = createServer();
    await Promise.all([db.startDB(), redisConnect()]);

    setImmediate(async () => {
      try {
        const registerBGWorkers = async () => {
          try {
            registerWorkers({
              createClient: function (type, redisOpts: IORedis.RedisOptions) {
                switch (type) {
                  case 'subscriber':
                    return getBullSubscriber();
                  case 'bclient':
                    return newConnection(redisOpts);
                  case 'client':
                  default:
                    return getBullClient();
                }
              },
            });
            logger.info('Registering BG Job Workers success');
            return 'register bg job workers success';
          } catch (error) {
            logger.error(
              `Error registering jobs: ${
                error instanceof Error ? error.message : '-'
              }`,
            );
            throw `register bg job workers failed : ${
              error instanceof Error ? error.message : '-'
            }`;
          }
        };
        await registerBGWorkers();
      } catch (err) {
        console.log('start up actions failed');
      }
    });
    app.listen(port, () => {
      console.table(process.env);
      logger.info(`Puppeteer Server has started! Listening on ${port}`);
      setTimeout(() => {
        console.log('triggering og');
        ogJob.addEvent({
          id: 'test',
          position: [108.6328125, -5.615985819155327],
        });
      }, 5000);
    });
  } catch (error) {
    logger.error(
      `Error starting server: ${error instanceof Error ? error.message : '-'}`,
    );
  }
})();
