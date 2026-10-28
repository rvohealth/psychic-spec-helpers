export default async function visit(
  path: string,
  { baseUrl = 'http://localhost:3000' }: { baseUrl?: string } = {}
) {
  await page.goto(`${baseUrl}/${path.replace(/^\//, '')}`)
}
