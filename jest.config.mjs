import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '\\.css$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/lib/**/*.{ts,tsx}',
    'src/services/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    'src/types/**/*.{ts,tsx}',
    'src/repositories/**/*.{ts,tsx}',
    'src/config/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    'src/providers/**/*.{ts,tsx}',
    'src/infrastructure/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/infrastructure/gokwik/KwikPass.tsx',
  ],
  coverageThreshold: {},
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
};

export default createJestConfig(config);
