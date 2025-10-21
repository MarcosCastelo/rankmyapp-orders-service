module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: {
      branches: 0.6,
      functions: 0.6,
      lines: 0.6,
      statements: 0.6
    }
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/']
};
