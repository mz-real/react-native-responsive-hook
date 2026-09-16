module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/test/reactNativeStub.js',
  },
  testMatch: ['<rootDir>/src/__tests__/**/*.test.{ts,tsx}'],
};
