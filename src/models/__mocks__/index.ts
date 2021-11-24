import { Op } from 'sequelize';

type MockSequelizeQuery = {
  where: {
    [field: string]: string;
  };
};
type MockSequelizeInQuery = {
  where: {
    [field: string]: {
      [Op.in]: string[];
    };
  };
};

const db = {
  sequelize: {
    transaction: jest.fn(() => {
      return {
        commit: jest.fn(),
        rollback: jest.fn(),
      };
    }),
  },
};
export default db;
