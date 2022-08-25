process.env.NODE_ENV = 'test';

module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    'node_modules',
    '<rootDir>/src/models',
    '<rootDir>/src/redis',
    '<rootDir>/src/logger',
    '<rootDir>/src/externalServices',
    '<rootDir>/src/types',
  ],
  modulePathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/src/models'],
  setupFiles: ['dotenv/config'],
};
