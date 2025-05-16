export default async function captureAttributeFromClosestElementWithType(
  cssSelector: string,
  type: string,
  attribute: string
) {
  const el = await page.waitForSelector(cssSelector, { timeout: 3000 })

  const attributeValue = (await el!.evaluate(
    (element, type, attribute) => {
      // Traverse up the DOM tree to find the closest parent label element
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let currentElement = element
      let attrVal: string | null = null
      let millisDrift = 0
      const startMillis = Date.now()

      while (!attrVal && currentElement && millisDrift < 3000) {
        const currMillis = Date.now()
        millisDrift = currMillis - startMillis

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (currentElement.tagName === type.toUpperCase()) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          attrVal = Array.from(currentElement.attributes as { name: string; value: string }[]).find(
            attr => attr.name === attribute
          )?.['value'] as string
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          currentElement = currentElement.parentElement
        }
      }

      return attrVal
    },
    type,
    attribute
  )) as string

  return attributeValue
}
