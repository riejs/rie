import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['packages/**/src/**/*.ts'],
  coverageReporters: ['text', 'html'],
};

export default config;
