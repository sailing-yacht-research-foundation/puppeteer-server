process.env.NODE_ENV = 'test';

module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    'node_modules',
    '<rootDir>/src/models',
    '<rootDir>/src/redis',
    '<rootDir>/src/logger',
  ],
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  setupFiles: ['dotenv/config'],
};
