import * as importingEventsJob from '../jobs/importingEventsJob';
import logger from '../logger';
import {
  YachtScoringImportedCrewDataToSave,
  YachtScoringImportedParticipantDataToSave,
  YachtScoringImportedVesselDataToSave,
} from '../types/General-Type';

export function queueImportEvent(
  data: {
    source: string;
    vesselParticipantGroupId: string;
    vesselToSave: YachtScoringImportedVesselDataToSave[];
    participantToSave: YachtScoringImportedParticipantDataToSave[];
    crewToSave: YachtScoringImportedCrewDataToSave[];
  },
  eventId: string,
) {
  try {
    importingEventsJob.addJob(data, { jobId: eventId });
    return true;
  } catch (error) {
    logger.error(
      `Error queueing Import Event Job. Source: ${data.source}, JobID: ${eventId}`,
    );
    return false;
  }
}
