// Jest setup file to handle global test configuration

// Set test environment
process.env.NODE_ENV = 'test';

// Clean up any hanging connections after all tests
afterAll(async () => {
  // Allow some time for any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 200));
});