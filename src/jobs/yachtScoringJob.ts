import Bull from 'bull';
import { v4 as uuidv4 } from 'uuid';

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
  YachtScoringGetEventData,
  YachtScoringImportEventData,
  YachtScoringJobData,
  YachtScoringTestCredentialsData,
  YachtScoringYacht,
} from '../types/YachtScoring-Type';
import {
  YachtScoringImportedCrewDataToSave,
  YachtScoringImportedParticipantDataToSave,
  YachtScoringImportedVesselDataToSave,
} from '../types/General-Type';
import {
  fetchEventData,
  fetchVessels,
  mapUserByEmail,
} from '../services/fetchDBData';
import { queueImportEvent } from '../services/queueImportEvent';

var yachtScoringQueue: Bull.Queue<YachtScoringJobData>;

export const testCredentialsWorker = async (
  job: Bull.Job<YachtScoringTestCredentialsData>,
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

export const getEventsWorker = async (
  job: Bull.Job<YachtScoringGetEventData>,
) => {
  const { id } = job.data;

  let isSuccessful = false;
  let message = '';
  let events: { eventId: string; eventName: string }[] = [];
  if (!id) {
    logger.error(`YS Get Events Skipped, data incomplete. id: ${id}`);
    message = 'No ID Provided';
  }

  const credential = await db.externalServiceCredential.findByPk(id);
  if (!credential) {
    logger.error(`YS Get Events Skipped, Credentials not found`);
    message = 'No credentials found';
  }

  if (credential) {
    const cryptoUtil = aes256GCM(
      process.env.CRYPTO_INTERNAL_AES_GCM_KEY as string,
    );
    const decryptedPassword = cryptoUtil.decrypt(credential.password);
    try {
      const ysEvents = await yachtScoring.fetchEvents(
        credential.userId,
        decryptedPassword,
      );
      events = ysEvents
        .filter((row) => row.eventId !== undefined)
        .map((row) => {
          return { eventId: row.eventId as string, eventName: row.eventName };
        });
      isSuccessful = true;
    } catch (error) {
      logger.error('Failed to get events For YachtScoring:', error);
    }
  }

  return { isSuccessful, message, events };
};

export const importEventDataWorker = async (
  job: Bull.Job<YachtScoringImportEventData>,
) => {
  const { credentialId, ysEventId, calendarEventId } = job.data;

  let isSuccessfulScrape = false;
  let isSuccessfulQueueingImport = false;
  let yachts: YachtScoringYacht[] = [];
  if (!credentialId || !ysEventId) {
    logger.error(
      `YS Import Event Job Skipped, data incomplete. credentialId: ${credentialId} | ysEventId: ${ysEventId}`,
    );
  }

  const credential = await db.externalServiceCredential.findByPk(credentialId);
  if (!credential) {
    logger.error(`YS Get Events Skipped, Credentials not found`);
  }

  if (credential) {
    const cryptoUtil = aes256GCM(
      process.env.CRYPTO_INTERNAL_AES_GCM_KEY as string,
    );
    const decryptedPassword = cryptoUtil.decrypt(credential.password);

    try {
      yachts = await yachtScoring.scrapeEventById(
        credential.userId,
        decryptedPassword,
        ysEventId,
      );
      isSuccessfulScrape = true;
    } catch (error) {
      logger.error('Failed to import event For YachtScoring:', error);
    }
  }

  if (isSuccessfulScrape) {
    const vesselOriginalIds = yachts.map((row) => {
      return row.id;
    });
    const vesselToSave: YachtScoringImportedVesselDataToSave[] = [];
    const participantToSave: YachtScoringImportedParticipantDataToSave[] = [];
    const crewToSave: YachtScoringImportedCrewDataToSave[] = [];
    let vesselParticipantGroupId: string;
    try {
      const {
        vesselParticipantGroupId: vpgId,
        existingVesselParticipants,
        existingCrews,
        existingParticipants,
      } = await fetchEventData(calendarEventId);
      const existingVessels = await fetchVessels(vesselOriginalIds);

      vesselParticipantGroupId = vpgId;
      for (let i = 0; i < yachts.length; i++) {
        const { id, yachtName, yachtType, length, crews } = yachts[i];

        let vesselData: YachtScoringImportedVesselDataToSave = {
          id: uuidv4(),
          vesselId: id,
          globalId: id,
          lengthInMeters: length,
          publicName: yachtName,
          model: yachtType,
          source: externalServiceSources.yachtscoring,
          vesselParticipantId: uuidv4(),
        };
        const existVessel = existingVessels.find((row) => {
          return (
            row.vesselId === id &&
            row.source === externalServiceSources.yachtscoring
          );
        });
        if (existVessel) {
          vesselData.id = existVessel.id;
          const vp = existingVesselParticipants.find(
            (row) => row.vesselId === existVessel.id,
          );
          if (vp) {
            vesselData.vesselParticipantId = vp.id;
          }
        }

        const mapUserProfile = await mapUserByEmail(
          crews.map((row) => row.email),
        );
        crews.forEach((row) => {
          const userProfile = mapUserProfile.get(row.email);
          const existParticipant = existingParticipants.find((existRow) => {
            return existRow.participantId === row.email;
          });
          const existCrew = existingCrews.find((existRow) => {
            return (
              existParticipant !== undefined &&
              existRow.participantId === existParticipant.id
            );
          });
          const participantId = existParticipant?.id || uuidv4();
          participantToSave.push({
            id: participantId,
            participantId: row.email,
            publicName: row.name,
            calendarEventId,
            email: row.email,
            userProfileId: userProfile?.id,
            isNew: !existParticipant,
          });
          crewToSave.push({
            id: existCrew?.id,
            participantId,
            vesselParticipantId: vesselData.vesselParticipantId,
          });
        });

        vesselToSave.push(vesselData);
      }

      isSuccessfulQueueingImport = queueImportEvent(
        {
          source: externalServiceSources.yachtscoring,
          calendarEventId,
          vesselParticipantGroupId,
          vesselToSave,
          participantToSave,
          crewToSave,
        },
        calendarEventId,
      );
    } catch (error) {
      logger.error('Failed to fetch event data: ', error);
    }
  }
  logger.info(
    `YS Import Event Done, Scrape status: ${
      isSuccessfulScrape ? 'Success' : 'Failed'
    } - Queueing import: ${isSuccessfulQueueingImport ? 'Success' : 'Failed'}`,
  );
  return { isSuccessfulScrape, isSuccessfulQueueingImport };
};

export const worker = async (
  job: Bull.Job<YachtScoringJobData>,
): Promise<any> => {
  switch (job.data.type) {
    case ValidYachtScoringJobType.testCredentials:
      const credentialsValid = await testCredentialsWorker(
        job as Bull.Job<YachtScoringTestCredentialsData>,
      );
      return credentialsValid;
    case ValidYachtScoringJobType.getEvents:
      const events = await getEventsWorker(
        job as Bull.Job<YachtScoringGetEventData>,
      );
      return events;
    case ValidYachtScoringJobType.importEventData:
      const yachts = await importEventDataWorker(
        job as Bull.Job<YachtScoringImportEventData>,
      );
      return yachts;
    default:
      return null;
  }
};
export const setup = (opts: Bull.QueueOptions) => {
  yachtScoringQueue = new Bull(bullQueues.yachtScoringTestCredentials, opts);
  yachtScoringQueue.process(1, worker);

  yachtScoringQueue.on('failed', (job, err) => {
    logger.error(`YachtScoring job failed. JobID: [${job.id}], Error: ${err}`);
  });
  yachtScoringQueue.on('completed', (job) => {
    logger.info(`Yachtscoring job completed. JobID: [${job.id}]`);
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
