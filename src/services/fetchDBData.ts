import { Op } from 'sequelize';

import db from '../models';
import { UserProfileInterface } from '../types/Model-Type';

export async function fetchEventData(calendarEventId: string) {
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

  const existingVesselParticipants = await db.vesselParticipant.findAll({
    where: {
      vesselParticipantGroupId: vpgData.id,
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

  return {
    vesselParticipantGroupId: vpgData.id,
    existingVesselParticipants,
    existingParticipants,
    existingCrews,
  };
}

export async function fetchVessels(originalIds: string[]) {
  const existingVessels = await db.vessel.findAll({
    where: {
      vesselId: {
        [Op.in]: originalIds,
      },
    },
    raw: true,
  });
  return existingVessels;
}

export async function mapUserByEmail(emails: string[]) {
  const userProfiles = await db.userProfile.findAll({
    where: {
      email: {
        [Op.in]: emails,
      },
    },
    raw: true,
  });
  const userProfileMap = new Map<string, UserProfileInterface>();
  userProfiles.forEach((row) => {
    if (row.email) {
      userProfileMap.set(row.email, row);
    }
  });

  return userProfileMap;
}
