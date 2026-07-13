module.exports = {
  preset: '@react-native/jest-preset',
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transformIgnorePatterns: [],
  moduleNameMapper: {
    '^remend$': '<rootDir>/node_modules/remend/dist/index.js',
  },
  // Reuse example's React/RN install; root holds markdown stack deps (remend, unified, …).
  modulePaths: ['<rootDir>/node_modules', '<rootDir>/example/node_modules'],
};
