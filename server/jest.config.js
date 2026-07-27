// Jest configuration for the backend test suite.
module.exports = {
  testEnvironment: 'node', // no DOM needed, this is an API-only backend
  setupFiles: ['<rootDir>/tests/jest.setup.js'], // loads env vars/test DB setup before tests run
  testTimeout: 20000, // generous timeout to allow for DB operations in tests
};
