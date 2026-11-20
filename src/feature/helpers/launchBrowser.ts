import puppeteer, { LaunchOptions } from 'puppeteer'

// Report a fine, hover-capable primary pointer (6 = fine | hover, widget/LookAndFeel.h),
// as Firefox already does headless on macOS and Windows, and on Linux from Firefox 161
// (Mozilla Bug 2083712). Before 161, headless Linux Firefox reports no pointer, so
// `(hover: hover)` (Tailwind v4's `hover:`) and `(pointer: fine)` never match there.
// Playwright's desktop contexts report the same on every engine and platform.
const DESKTOP_POINTER_PREFS_FIREFOX = {
  'ui.primaryPointerCapabilities': 6,
  'ui.allPointerCapabilities': 6,
}

export default async function launchBrowser(opts?: LaunchOptions) {
  const launchOpts: LaunchOptions = {
    browser: 'firefox',
    dumpio: process.env.DEBUG === '1',
    headless: process.env.HEADLESS !== '0',
    ...opts,
  }

  // Merged under the caller's prefs, so a key the caller passes wins (Playwright's rule).
  if (launchOpts.browser !== 'chrome') {
    launchOpts.extraPrefsFirefox = { ...DESKTOP_POINTER_PREFS_FIREFOX, ...opts?.extraPrefsFirefox }
  }

  return await puppeteer.launch(launchOpts)
}
