/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
    },
  },
  moduleNameMapper: {
    '^../src/lib/prisma$': '<rootDir>/tests/__mocks__/prisma.ts',
    '^../../src/lib/prisma$': '<rootDir>/tests/__mocks__/prisma.ts',
    '^../lib/prisma$': '<rootDir>/tests/__mocks__/prisma.ts',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/config/**',
  ],
  coverageDirectory: 'coverage',
  clearMocks: true,
  restoreMocks: true,
};

