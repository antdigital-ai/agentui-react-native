module.exports = {
  preset: '@react-native/jest-preset',
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transformIgnorePatterns: [],
  // Reuse example's React/RN install so root devDependencies don't duplicate them.
  modulePaths: ['<rootDir>/example/node_modules'],
};
