import Bull from 'bull';

import db from '../models';
import { bullQueues } from '../models/syrf-schema/enums';
import { uploadMapScreenshot } from '../externalServices/s3';
import { createMapScreenshot } from '../utils/createMapScreenshot';
import logger from '../logger';

var openGraphQueue: Bull.Queue<any>;

// TODO: Type the any
export const eventWorker = async (job: Bull.Job<any>) => {
  const { id, position } = job.data || {};

  if (!id || !position) return;

  const imageBuffer = await createMapScreenshot(position);
  const response = await uploadMapScreenshot(
    imageBuffer,
    `calendar-event/${id}.jpg`,
  );
  // TODO: Test if we can use the dataAccess. Probably not since using typed models
  // await dataAccess.addOpenGraph(id, response.Location);
};

// TODO: Type the any
export const competitionUnitWorker = async (job: Bull.Job<any>) => {
  const { idList = [], centerPoint } = job.data || {};
  const transaction = await db.sequelize.transaction();

  try {
    const imageBuffer = await createMapScreenshot(centerPoint);
    // TODO:
    // await Promise.all(
    //   // Loop for multiple competitions with same course
    //   idList.map(async (id) => {
    //     const response = await uploadMapScreenshot(
    //       imageBuffer,
    //       `competition/${id}.jpg`,
    //     );
    //     const openGraphImage = response.Location;
    //     await competitionUnitDataAccess.addOpenGraphImage(
    //       idList,
    //       {
    //         openGraphImage,
    //       },
    //       transaction,
    //     );
    //   }),
    // );
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// TODO: Type the any
export const worker = async (job: Bull.Job<any>) => {
  switch (job.data.type) {
    case 'event':
      await exports.eventWorker(job);
      break;
    case 'competition-unit':
      await exports.competitionUnitWorker(job);
      break;
    default:
      break;
  }
};
export const setup = (opts: Bull.QueueOptions) => {
  openGraphQueue = new Bull(bullQueues.openGraph, opts);

  openGraphQueue.process(1, exports.worker);

  openGraphQueue.on('failed', (job, err) => {
    logger.error(
      `Generate Open Graph Failed. JobID: [${job.id}], Error: ${err}`,
    );
  });
  openGraphQueue.on('completed', (job) => {
    logger.info(`Generate OG Completed. JobID: [${job.id}]`);
  });
};

export const addEvent = async (
  data: any, // TODO: Type this
  opts?: Bull.JobOptions & { jobId?: string },
) => {
  if (opts?.jobId) {
    await openGraphQueue.removeJobs(opts.jobId);
  }
  await openGraphQueue.add(
    { ...data, type: 'event' },
    {
      removeOnFail: true,
      removeOnComplete: true,
      ...opts,
    },
  );
};

export const addCompetitionUnit = async (
  data: any,
  opts: Bull.JobOptions & { jobId?: string },
) => {
  if (opts.jobId) {
    await openGraphQueue.removeJobs(opts.jobId);
  }
  await openGraphQueue.add(
    { ...data, type: 'competition-unit' },
    {
      removeOnFail: true,
      removeOnComplete: true,
      ...opts,
    },
  );
};

export const removeJob = async (jobId: string) => {
  await openGraphQueue.removeJobs(jobId);
};
