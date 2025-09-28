// backend/api/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  globals: { 'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' } }, // 👈 זה הנכון
};

export default config;
