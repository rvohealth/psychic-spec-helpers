// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function isPuppeteerPage(page: any): boolean {
  return typeof page === 'object' && page !== null && !!(page as Record<'mouse', boolean>).mouse
}
