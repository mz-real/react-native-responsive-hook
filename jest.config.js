module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^react-native$': '<rootDir>/test/reactNativeStub.js',
  },
  testMatch: ['<rootDir>/__tests__/**/*.test.js'],
};
