module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/test/reactNativeStub.js',
  },
  testMatch: ['<rootDir>/src/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['src/**/*.ts', '!src/__tests__/**'],
  coverageThreshold: {
    global: { statements: 100, branches: 95, functions: 100, lines: 100 },
  },
};
