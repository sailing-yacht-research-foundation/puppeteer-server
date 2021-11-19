import Bull from 'bull';

import db from '../models';
import logger from '../logger';
import {
  bullQueues,
  externalServiceSources,
} from '../models/syrf-schema/enums';
import yachtScoring from '../services/yachtScoring';
import { aes256GCM } from '../utils/aesCrypto';

import {
  ValidYachtScoringJobType,
  YachtScoringJobData,
  YachtScoringTestCredentialsData,
} from '../types/YachtScoring-Type';

var yachtScoringQueue: Bull.Queue<YachtScoringJobData>;

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
    return false;
  }

  let isSuccessful = false;
  try {
    isSuccessful = await yachtScoring.testCredentials(user, password);
    if (isSuccessful) {
      const cryptoUtil = aes256GCM(
        process.env.CRYPTO_INTERNAL_AES_GCM_KEY as string,
      );
      const encryptedPassword = await cryptoUtil.encrypt(password);
      await db.externalServiceCredential.bulkCreate(
        [
          {
            userProfileId,
            source: externalServiceSources.yachtscoring,
            userId: user,
            password: encryptedPassword,
          },
        ],
        {
          updateOnDuplicate: ['password', 'updatedAt'],
        },
      );
    } else {
      logger.error(`Unable to use YacthScoring Credentials provided to login`);
    }
  } catch (error) {
    logger.error('Failed to test credentials For YachtScoring:', error);
  }
  return isSuccessful;
};

export const worker = async (
  job: Bull.Job<YachtScoringJobData>,
): Promise<boolean> => {
  let jobResult = false;
  switch (job.data.type) {
    case ValidYachtScoringJobType.testCredentials:
      jobResult = await testCredentialsWorker(
        job as Bull.Job<YachtScoringTestCredentialsData>,
      );
      break;
  }
  return jobResult;
};
export const setup = (opts: Bull.QueueOptions) => {
  yachtScoringQueue = new Bull(bullQueues.yachtScoringTestCredentials, opts);
  yachtScoringQueue.process(1, worker);

  yachtScoringQueue.on('failed', (job, err) => {
    logger.error(
      `Testing YachtScoring credentials Failed. JobID: [${job.id}], Error: ${err}`,
    );
  });
  yachtScoringQueue.on('completed', (job) => {
    job.remove();
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
  return await yachtScoringQueue.add(data, {
    removeOnFail: true,
    removeOnComplete: true,
    ...opts,
  });
};

export const removeJob = async (jobId: string) => {
  await yachtScoringQueue.removeJobs(jobId);
};
