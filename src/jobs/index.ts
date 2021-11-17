import Bull from 'bull';
import logger from '../logger';

import { createClient } from '../redis';
import * as ogJob from './openGraph';

export const registerWorkers = (opts: Bull.QueueOptions) => {
  ogJob.setup(opts);
};

export const registerBGWorkers = async () => {
  try {
    registerWorkers({ createClient });
    logger.info('Registering BG Job Workers success');
  } catch (error) {
    logger.error(
      `Error registering jobs: ${error instanceof Error ? error.message : '-'}`,
    );
    throw `register bg job workers failed : ${
      error instanceof Error ? error.message : '-'
    }`;
  }
};
