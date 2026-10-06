import { expect } from 'vitest'
import '../../../src/index.js'

// Compiled by build:test-app; never invoked at runtime.
export async function toEvaluateTypeExamples() {
  const received = { ready: true }
  const opts = { failureText: (actual: unknown) => `Unexpected result: ${String(actual)}` }

  await expect(received).toEvaluate(
    (argument: typeof received) => ({ pass: argument.ready, actual: argument }),
    opts
  )
  await expect(received).toEvaluate(
    async (argument: typeof received) =>
      await Promise.resolve({ pass: argument.ready, actual: argument }),
    opts
  )
  await expect.soft(17).toEvaluate(() => ({ pass: true, actual: 17 }), opts)

  // @ts-expect-error A bare Boolean does not supply the runtime's pass and actual result.
  await expect(received).toEvaluate(() => true, opts)
  // @ts-expect-error An asynchronous Boolean also lacks the structured result.
  await expect(received).toEvaluate(async () => await Promise.resolve(true), opts)
}
