import { ModelCtor, Sequelize } from 'sequelize';

import calendarEventModel from './syrf-schema/entities/CalendarEvent';
import competitionUnitModel from './syrf-schema/entities/CompetitionUnit';
import externalServiceCredentialModel from './syrf-schema/entities/ExternalServiceCredential';

import {
  CalendarEventInterface,
  CompetitionUnitInterface,
  ExternalServiceCredentialInterface,
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
  startDB: async () => {
    await sequelize.authenticate();
    logger.info(`Main DB Connected!`);
  },
};

export default db;
