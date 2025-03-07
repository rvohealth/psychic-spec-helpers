import sleep from '../../shared/sleep.js'

export default async function evaluateWithRetryAndTimeout(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  argumentPassedToExpect: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evaluationFn: (a: any) => ExpectToEvaluateReturnType | Promise<ExpectToEvaluateReturnType>,
  opts: ExpectToEvaluateOpts
) {
  const timeout = opts.timeout || 4000
  const interval = opts.interval || 10
  const startTime = Date.now()

  async function intervalCb() {
    const res = await evaluationFn(argumentPassedToExpect)
    const expired = Date.now() >= startTime + timeout

    if (res.pass) {
      return {
        message: () => (opts.successText ? opts.successText(res.actual) : 'Success'),
        pass: true,
      }
    }

    if (expired) {
      return {
        message: () => opts.failureText(res.actual),
        pass: false,
      }
    }

    await sleep(interval)
    return await intervalCb()
  }

  return await intervalCb()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExpectToEvaluateReturnType = { pass: boolean; actual: any }

export interface ExpectToEvaluateOpts {
  timeout?: number
  interval?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  successText?: (received: any) => string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  failureText: (received: any) => string
}
