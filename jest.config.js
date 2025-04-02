module.exports = {
  preset: 'react-native',
  modulePathIgnorePatterns: [
    '<rootDir>/example/node_modules',
    '<rootDir>/lib/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|@expo|expo|react-native-builder-bob)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};