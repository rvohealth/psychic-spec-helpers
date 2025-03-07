export default function isPuppeteerPage(page: any): boolean {
  return typeof page === 'object' && page !== null && !!page.mouse
}
