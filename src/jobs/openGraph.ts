import Bull from 'bull';

import db from '../models';
import { bullQueues } from '../models/syrf-schema/enums';
import { uploadMapScreenshot } from '../externalServices/s3';
import { createMapScreenshot } from '../utils/createMapScreenshot';
import logger from '../logger';
import jimp from 'jimp';

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

var openGraphQueue: Bull.Queue<OGJobData>;

const THUMBNAIL_WIDTH = 150;

export const eventWorker = async (job: Bull.Job<EventOGJobData>) => {
  const { id, position } = job.data || {};

  if (!id || !position) {
    logger.error(
      `OG Job (Event) Skipped, data incomplete. ID: ${id} | position: ${position}`,
    );
    return;
  }

  logger.info(`Calendar Event OpenGraph Image Generation started for: ${id}`);

  try {
    const imageBuffer = await createMapScreenshot(position);
    const image = await jimp.read(imageBuffer);
    const thumbnailBuffer = await image
      .resize(THUMBNAIL_WIDTH, jimp.AUTO, jimp.RESIZE_BILINEAR)
      .getBufferAsync(jimp.MIME_JPEG);

    const [response] = await Promise.allSettled([
      uploadMapScreenshot(imageBuffer, `calendar-event/${id}.jpg`),
      uploadMapScreenshot(
        thumbnailBuffer,
        `calendar-event/${id}_thumbnail.jpg`,
      ),
    ]);
    if (response.status === 'fulfilled' && response?.value?.Location) {
      await db.calendarEvent.update(
        { openGraphImage: response.value.Location },
        {
          where: {
            id,
          },
        },
      );
    }
    logger.info('Calendar Event OpenGraph Image updated to DB');
  } catch (error) {
    logger.error('Failed to generate OG For Event:', error);
  }
};

export const competitionUnitWorker = async (
  job: Bull.Job<CompetitionOGJobData>,
) => {
  const { idList = [], position } = job.data || {};

  try {
    logger.info(
      `Competition Unit OpenGraph Image Generation started for: ${idList.join(
        ', ',
      )}`,
    );
    const imageBuffer = await createMapScreenshot(position);

    const data = await Promise.all(
      // Loop for multiple competitions with same course
      // Note: Intended to separate the image files for each competition even if the image is identical
      idList.map(async (id) => {
        const response = await uploadMapScreenshot(
          imageBuffer,
          `competition/${id}.jpg`,
        );
        return {
          id,
          openGraphImage: response?.Location,
        };
      }),
    );
    await db.competitionUnit.bulkCreate(data, {
      fields: ['id', 'openGraphImage'],
      updateOnDuplicate: ['openGraphImage'],
    });
    logger.info('Competition Unit OpenGraph Image updated to DB');
  } catch (error) {
    logger.error('Failed to generate OG For Competitions:', error);
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
    job.remove();
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
