import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    dir: './spec/features',
    globals: true,
    setupFiles: ['luxon-jest-matchers', './spec/features/setup/hooks.js'],
    fileParallelism: false,
    maxConcurrency: 1,
    maxWorkers: 1,
    mockReset: true,
    watch: false,
    printConsoleTrace: true,
    hookTimeout: 10000,
    testTimeout: 10000,

    globalSetup: './spec/features/setup/globalSetup.js',
  },
})
