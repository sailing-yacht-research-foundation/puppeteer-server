import { ModelCtor, Sequelize } from 'sequelize';

import calendarEventModel from './syrf-schema/entities/CalendarEvent';
import competitionUnitModel from './syrf-schema/entities/CompetitionUnit';
import externalServiceCredentialModel from './syrf-schema/entities/ExternalServiceCredential';
import participantModel from './syrf-schema/entities/Participant';
import userProfileModel from './syrf-schema/entities/UserProfile';
import vesselModel from './syrf-schema/entities/Vessel';
import vesselParticipantModel from './syrf-schema/entities/VesselParticipant';
import vesselParticipantCrewModel from './syrf-schema/entities/VesselParticipantCrew';
import vesselParticipantGroupModel from './syrf-schema/entities/VesselParticipantGroup';

import {
  CalendarEventInterface,
  CompetitionUnitInterface,
  ExternalServiceCredentialInterface,
  ParticipantInterface,
  UserProfileInterface,
  VesselInterface,
  VesselParticipantInterface,
  VesselParticipantCrewInterface,
  VesselParticipantGroupInterface,
} from '../types/Model-Type';
import logger from '../logger';

if (
  !process.env.MAIN_DB_NAME ||
  !process.env.MAIN_DB_USER ||
  !process.env.MAIN_DB_PASSWORD ||
  !process.env.MAIN_DB_HOST ||
  !process.env.MAIN_DB_PORT
) {
  throw new Error('DB not setup');
}
const sequelize = new Sequelize(
  process.env.MAIN_DB_NAME,
  process.env.MAIN_DB_USER,
  process.env.MAIN_DB_PASSWORD,
  {
    host: process.env.MAIN_DB_HOST,
    port: Number(process.env.MAIN_DB_PORT),
    dialect: 'postgres',
    logging: false,
  },
);

const db: {
  sequelize: Sequelize;
  startDB: () => Promise<void>;
  calendarEvent: ModelCtor<CalendarEventInterface>;
  competitionUnit: ModelCtor<CompetitionUnitInterface>;
  externalServiceCredential: ModelCtor<ExternalServiceCredentialInterface>;
  participant: ModelCtor<ParticipantInterface>;
  userProfile: ModelCtor<UserProfileInterface>;
  vessel: ModelCtor<VesselInterface>;
  vesselParticipant: ModelCtor<VesselParticipantInterface>;
  vesselParticipantCrew: ModelCtor<VesselParticipantCrewInterface>;
  vesselParticipantGroup: ModelCtor<VesselParticipantGroupInterface>;
} = {
  sequelize,
  calendarEvent: calendarEventModel(
    sequelize,
  ) as unknown as ModelCtor<CalendarEventInterface>,
  competitionUnit: competitionUnitModel(
    sequelize,
  ) as unknown as ModelCtor<CompetitionUnitInterface>,
  externalServiceCredential: externalServiceCredentialModel(
    sequelize,
  ) as unknown as ModelCtor<ExternalServiceCredentialInterface>,
  participant: participantModel(
    sequelize,
  ) as unknown as ModelCtor<ParticipantInterface>,
  userProfile: userProfileModel(
    sequelize,
  ) as unknown as ModelCtor<UserProfileInterface>,
  vessel: vesselModel(sequelize) as unknown as ModelCtor<VesselInterface>,
  vesselParticipant: vesselParticipantModel(
    sequelize,
  ) as unknown as ModelCtor<VesselParticipantInterface>,
  vesselParticipantCrew: vesselParticipantCrewModel(
    sequelize,
  ) as unknown as ModelCtor<VesselParticipantCrewInterface>,
  vesselParticipantGroup: vesselParticipantGroupModel(
    sequelize,
  ) as unknown as ModelCtor<VesselParticipantGroupInterface>,
  startDB: async () => {
    await sequelize.authenticate();
    logger.info(`Main DB Connected!`);
  },
};

export default db;
