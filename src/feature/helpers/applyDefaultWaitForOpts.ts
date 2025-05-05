import { WaitForSelectorOptions } from 'puppeteer'

export default function applyDefaultWaitForOpts(
  opts: WaitForSelectorOptions = {}
): WaitForSelectorOptions {
  return {
    timeout: 5000,
    ...opts,
  }
}
