import Bull from 'bull';

import db from '../models';
import logger from '../logger';
import {
  bullQueues,
  externalServiceSources,
} from '../models/syrf-schema/enums';
import { uploadMapScreenshot } from '../externalServices/s3';
import { createMapScreenshot } from '../utils/createMapScreenshot';
import { testCredentials } from '../services/yachtScoring';

type YachtScoringTestCredentialsData = {
  type: 'test-credentials';
  userProfileId: string;
  user: string;
  password: string;
};

type YachtScoringJobData = YachtScoringTestCredentialsData;

var yachtScoringQueue: Bull.Queue<any>;

export const testCredentialsWorker = async (
  job: Bull.Job<YachtScoringJobData>,
) => {
  const { userProfileId, user, password } = job.data;

  if (!userProfileId || !user || !password) {
    logger.error(
      `YS Test Credentials Job Skipped, data incomplete. user: ${user} | password: ${
        password == null ? 'null/undefined' : ''
      } | userProfileId: ${userProfileId}`,
    );
    return;
  }

  try {
    const isSuccessful = await testCredentials(user, password);
    if (isSuccessful) {
      await db.externalServiceCredential.upsert(
        {
          userProfileId,
          source: externalServiceSources.yachtscoring,
          userId: user,
          password: '*****', // TODO: Encrypt this
        },
        {
          fields: ['password'],
        },
      );
    } else {
      logger.error(`Unable to use YacthScoring Credentials provided to login`);
    }
  } catch (error) {
    logger.error('Failed to test credentials For YachtScoring:', error);
  }
};

export const worker = async (job: Bull.Job<YachtScoringJobData>) => {
  switch (job.data.type) {
    case 'test-credentials':
      await testCredentialsWorker(
        job as Bull.Job<YachtScoringTestCredentialsData>,
      );
      break;
    default:
      break;
  }
};
export const setup = (opts: Bull.QueueOptions) => {
  yachtScoringQueue = new Bull(bullQueues.openGraph, opts);
  yachtScoringQueue.process(1, worker);

  yachtScoringQueue.on('failed', (job, err) => {
    logger.error(
      `Testing YachtScoring credentials Failed. JobID: [${job.id}], Error: ${err}`,
    );
  });
  yachtScoringQueue.on('completed', (job) => {
    logger.info(
      `Testing YachtScoring credentials Completed. JobID: [${job.id}]`,
    );
  });
};

export const addJob = async (
  data: YachtScoringJobData,
  opts?: Bull.JobOptions & { jobId?: string },
) => {
  if (opts?.jobId) {
    await yachtScoringQueue.removeJobs(opts.jobId);
  }
  await yachtScoringQueue.add(data, {
    removeOnFail: true,
    removeOnComplete: true,
    ...opts,
  });
};

export const removeJob = async (jobId: string) => {
  await yachtScoringQueue.removeJobs(jobId);
};
