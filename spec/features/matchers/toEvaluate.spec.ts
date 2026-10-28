import type { Page } from 'puppeteer'
import '../../../src/index.js'

describe('toEvaluate', () => {
  it('accepts synchronous success and preserves an arbitrary received value', async () => {
    const received = { label: 'ready' }
    let calls = 0
    await expect(received).toEvaluate(
      (argument: unknown) => {
        expect(argument).toBe(received)
        calls++
        return { pass: true, actual: received }
      },
      { failureText: () => 'Unexpected failure' }
    )
    expect(calls).toBe(1)
  })

  it('accepts asynchronous success from a real page query', async () => {
    await expect(page).toEvaluate(
      async (received: Page) => {
        expect(received).toBe(page)
        const actual = await received.$eval(
          '#my-div',
          (element: { textContent: string | null }) => element.textContent
        )
        return { pass: actual === 'My div', actual }
      },
      { failureText: (actual: unknown) => `Unexpected page text: ${String(actual)}` }
    )
  })

  it('retries unsuccessful results until success with the same received value', async () => {
    const received = Symbol('received')
    let calls = 0
    await expect(received).toEvaluate(
      (argument: unknown) => {
        expect(argument).toBe(received)
        calls++
        return { pass: calls === 3, actual: calls }
      },
      { interval: 5, timeout: 1000, failureText: () => 'Did not become ready' }
    )
    expect(calls).toBe(3)
  })

  it('reports the final actual value when retries time out', async () => {
    const received = { label: 'waiting' }
    let calls = 0
    let finalActual: unknown
    await expect(async () => {
      await expect(received).toEvaluate(
        (argument: unknown) => {
          expect(argument).toBe(received)
          calls++
          finalActual = { attempt: calls }
          return { pass: false, actual: finalActual }
        },
        {
          interval: 5,
          timeout: 40,
          failureText: (actual: unknown) => {
            expect(actual).toBe(finalActual)
            return `Still waiting after attempt ${calls}`
          },
        }
      )
    }).rejects.toThrow(/Still waiting after attempt \d+/)
    expect(calls).toBeGreaterThan(1)
  })

  it('passes successful actual values to custom negated diagnostics', async () => {
    const actual = { label: 'complete' }
    await expect(async () => {
      await expect('received').not.toEvaluate(() => ({ pass: true, actual }), {
        failureText: () => 'Unexpected failure',
        successText: (received: unknown) => {
          expect(received).toBe(actual)
          return 'Already complete'
        },
      })
    }).rejects.toThrow('Already complete')
  })

  it('retains the default successful diagnostic', async () => {
    await expect(async () => {
      await expect(17).not.toEvaluate(() => ({ pass: true, actual: 17 }), {
        failureText: () => 'Unexpected failure',
      })
    }).rejects.toThrow('Success')
  })
})
