module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['./__tests__/setup/mongodb.js'],
  verbose: true,
  testMatch: ['**/__tests__/**/*.test.js'],
};