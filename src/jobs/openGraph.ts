import Bull from 'bull';

import db from '../models';
import { bullQueues } from '../models/syrf-schema/enums';
import { uploadMapScreenshot } from '../externalServices/s3';
import { createMapScreenshot } from '../utils/createMapScreenshot';
import logger from '../logger';

type CompetitionOGJobData = {
  type: 'competition-unit';
  idList: string[];
  position: [number, number];
};
type EventOGJobData = {
  type: 'event';
  id: string;
  position: [number, number];
};
type OGJobData = EventOGJobData | CompetitionOGJobData;

var openGraphQueue: Bull.Queue<any>;

export const eventWorker = async (job: Bull.Job<EventOGJobData>) => {
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

export const competitionUnitWorker = async (
  job: Bull.Job<CompetitionOGJobData>,
) => {
  const { idList = [], position } = job.data || {};
  const transaction = await db.sequelize.transaction();

  try {
    const imageBuffer = await createMapScreenshot(position);
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

export const worker = async (job: Bull.Job<OGJobData>) => {
  switch (job.data.type) {
    case 'event':
      await eventWorker(job as Bull.Job<EventOGJobData>);
      break;
    case 'competition-unit':
      await competitionUnitWorker(job as Bull.Job<CompetitionOGJobData>);
      break;
    default:
      break;
  }
};
export const setup = (opts: Bull.QueueOptions) => {
  openGraphQueue = new Bull(bullQueues.openGraph, opts);

  openGraphQueue.process(1, worker);

  openGraphQueue.on('failed', (job, err) => {
    logger.error(
      `Generate Open Graph Failed. JobID: [${job.id}], Error: ${err}`,
    );
  });
  openGraphQueue.on('completed', (job) => {
    logger.info(`Generate OG Completed. JobID: [${job.id}]`);
  });
};

export const addJob = async (
  data: OGJobData,
  opts?: Bull.JobOptions & { jobId?: string },
) => {
  if (opts?.jobId) {
    await openGraphQueue.removeJobs(opts.jobId);
  }
  await openGraphQueue.add(data, {
    removeOnFail: true,
    removeOnComplete: true,
    ...opts,
  });
};

export const removeJob = async (jobId: string) => {
  await openGraphQueue.removeJobs(jobId);
};
