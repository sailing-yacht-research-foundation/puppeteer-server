import Bull from 'bull';

import logger from '../logger';
import { bullQueues } from '../models/syrf-schema/enums';

import { ImportingEventsJobData } from '../types/General-Type';

var importingEventsQueue: Bull.Queue<ImportingEventsJobData>;

/*
 * No worker defined in this queue, all saving to DB will be done by Live Data Server so that
 * we don't have to duplicate creating tracker url and adding more environment values to this service
 */

export const setup = (opts: Bull.QueueOptions) => {
  importingEventsQueue = new Bull(bullQueues.importingEvents, opts);
};

export const addJob = async (
  data: ImportingEventsJobData,
  opts?: Bull.JobOptions & { jobId?: string },
) => {
  logger.info('Queueing import event job');
  if (opts?.jobId) {
    logger.info('Removing existing event job', opts.jobId);
    await importingEventsQueue.removeJobs(opts.jobId);
  }
  return await importingEventsQueue.add(data, {
    removeOnFail: true,
    removeOnComplete: true,
    ...opts,
  });
};

export const removeJob = async (jobId: string) => {
  await importingEventsQueue.removeJobs(jobId);
};
