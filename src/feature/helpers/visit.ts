import { Page } from 'puppeteer'
import launchPage from './launchPage.js'

export default async function visit(
  path: string,
  { page, baseUrl = 'http://localhost:3000' }: { page?: Page; baseUrl?: string } = {}
) {
  page ||= await launchPage()
  await page.goto(`${baseUrl}/${path.replace(/^\//, '')}`)
  return page
}
