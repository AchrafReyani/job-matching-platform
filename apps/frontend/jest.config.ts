import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', // Transform your TS files
    '^.+\\.js$': 'ts-jest',       // Transform JS files in node_modules (for ESM)
  },

  transformIgnorePatterns: [
    '/node_modules/(?!until-async|another-esm-module)/', // allow ESM modules to be transformed
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],

  moduleDirectories: ['node_modules', '<rootDir>'],

  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  verbose: true,
};

export default config;
