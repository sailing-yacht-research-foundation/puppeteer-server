import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import * as yachtScoringJob from '../../jobs/yachtScoringJob';
import logger from '../../logger';
import db from '../../models';
import { externalServiceSources } from '../../models/syrf-schema/enums';
import {
  YachtScoringImportedCrewDataToSave,
  YachtScoringImportedParticipantDataToSave,
  YachtScoringImportedVesselDataToSave,
} from '../../types/General-Type';
import {
  ValidYachtScoringJobType,
  YachtScoringYacht,
} from '../../types/YachtScoring-Type';

export async function addCredentials(
  req: Request<
    unknown,
    unknown,
    { userProfileId: string; source: string; user: string; password: string }
  >,
  res: Response,
) {
  const { userProfileId, source, user, password } = req.body;
  let isSuccessful = false;
  switch (source) {
    case externalServiceSources.yachtscoring:
      const theJob = await yachtScoringJob.addJob({
        type: ValidYachtScoringJobType.testCredentials,
        userProfileId,
        user,
        password,
      });
      isSuccessful = await theJob.finished();
      break;
  }

  res.status(200).json({ isSuccessful });
}

export async function getEvents(
  req: Request<unknown, unknown, { id: string; source: string }>,
  res: Response,
) {
  const { id, source } = req.body;
  let result = {
    isSuccessful: false,
    message: '',
    events: [],
  };
  switch (source) {
    case externalServiceSources.yachtscoring:
      const theJob = await yachtScoringJob.addJob({
        type: ValidYachtScoringJobType.getEvents,
        id,
      });
      result = await theJob.finished();
      break;
  }

  res.status(200).json(result);
}

export async function importEventData(
  req: Request<
    unknown,
    unknown,
    {
      credentialId: string;
      externalEventId: string;
      calendarEventId: string;
      source: string;
    }
  >,
  res: Response,
) {
  const { credentialId, externalEventId, source, calendarEventId } = req.body;
  let result = {
    isSuccessful: false,
    message: '',
  };
  const eventData = await db.calendarEvent.findByPk(calendarEventId);
  if (!eventData) {
    throw new Error('Invalid Event');
  }
  const vpgData = await db.vesselParticipantGroup.findOne({
    where: {
      calendarEventId,
    },
  });
  if (!vpgData) {
    throw new Error('No VesselParticipant Group setup');
  }

  const vpgId = vpgData.id;

  const existingVesselParticipants = await db.vesselParticipant.findAll({
    where: {
      vesselParticipantGroupId: vpgId,
    },
    raw: true,
  });
  const existingVessels = await db.vessel.findAll({
    where: {
      id: {
        [Op.in]: existingVesselParticipants.map((row) => {
          return row.vesselId;
        }),
      },
    },
    raw: true,
  });
  const existingParticipants = await db.participant.findAll({
    where: {
      calendarEventId,
    },
    raw: true,
  });
  const existingCrews = await db.vesselParticipantCrew.findAll({
    where: {
      vesselParticipantId: {
        [Op.in]: existingVesselParticipants.map((row) => {
          return row.id;
        }),
      },
    },
    raw: true,
  });

  const vesselToSave: YachtScoringImportedVesselDataToSave[] = [];
  const participantToSave: YachtScoringImportedParticipantDataToSave[] = [];
  const crewToSave: YachtScoringImportedCrewDataToSave[] = [];
  switch (source) {
    case externalServiceSources.yachtscoring:
      const theJob = await yachtScoringJob.addJob({
        type: ValidYachtScoringJobType.importEventData,
        credentialId,
        ysEventId: externalEventId,
      });
      let ysResult: {
        isSuccessful: boolean;
        message: string;
        yachts: YachtScoringYacht[];
      } = await theJob.finished();
      result.isSuccessful = ysResult.isSuccessful;
      result.message = ysResult.message;
      // TODO: Process each yacht data
      // Do we delete all old data? Or just overwrite data from ys, and ignore datas created on syrf
      // VesselParticipant, Participant, Vessel, VesselParticipantCrew
      for (let i = 0; i < ysResult.yachts.length; i++) {
        const {
          id,
          // division,
          // class: vesselClass,
          // altClass,
          // sailNumber,
          yachtName,
          // ownerName,
          yachtType,
          length,
          // origin,
          // paid,
          crews,
        } = ysResult.yachts[i];

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
          console.log(existVessel);
          vesselData.id = existVessel.id;
          const vp = existingVesselParticipants.find(
            (row) => row.vesselId === existVessel.id,
          );
          if (vp) {
            vesselData.vesselParticipantId = vp.id;
          }
        }

        crews.forEach((row) => {
          const existParticipant = existingParticipants.find((existRow) => {
            return existRow.participantId === row.name;
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
            participantId: row.name,
            publicName: row.name,
            calendarEventId,
          });
          crewToSave.push({
            id: existCrew?.id,
            participantId,
            vesselParticipantId: vesselData.vesselParticipantId,
          });
        });

        vesselToSave.push(vesselData);
      }
      break;
  }

  const transaction = await db.sequelize.transaction();
  try {
    const vesselResult = await db.vessel.bulkCreate(
      vesselToSave.map((row) => {
        const { vesselParticipantId, ...vesselData } = row;
        return vesselData;
      }),
      {
        updateOnDuplicate: [
          'vesselId',
          'globalId',
          'lengthInMeters',
          'publicName',
          'model',
        ],
      },
    );
    const vpResult = await db.vesselParticipant.bulkCreate(
      vesselToSave.map((row) => {
        const { vesselParticipantId, id: vesselId } = row;
        return {
          id: vesselParticipantId,
          vesselId,
          vesselParticipantGroupId: vpgId,
        };
      }),
      { updateOnDuplicate: ['vesselId', 'vesselParticipantGroupId'] },
    );
    const participantResult = await db.participant.bulkCreate(
      participantToSave,
      { updateOnDuplicate: ['participantId', 'publicName', 'calendarEventId'] },
    );

    const crewResult = await db.vesselParticipantCrew.bulkCreate(crewToSave, {
      updateOnDuplicate: ['participantId', 'vesselParticipantId'],
    });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    logger.error(error);
  }

  res
    .status(200)
    .json({ vesselToSave, participantToSave, crewToSave, message: '' });
}

export default { addCredentials, getEvents, importEventData };
