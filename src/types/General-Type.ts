export type YachtScoringImportedVesselDataToSave = {
  id?: string;
  vesselId: string;
  globalId: string;
  lengthInMeters: number;
  publicName: string;
  model: string;
  source: string;
  vesselParticipantId: string;
};

export type YachtScoringImportedParticipantDataToSave = {
  id: string;
  participantId: string;
  publicName: string;
  calendarEventId: string;
  email: string;
  userProfileId?: string;
};

export type YachtScoringImportedCrewDataToSave = {
  id?: string;
  participantId: string;
  vesselParticipantId: string;
};

export type ImportingEventsJobData = {
  source: string;
  vesselParticipantGroupId: string;
  vesselToSave: YachtScoringImportedVesselDataToSave[];
  participantToSave: YachtScoringImportedParticipantDataToSave[];
  crewToSave: YachtScoringImportedCrewDataToSave[];
};
