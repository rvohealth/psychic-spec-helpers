export default function missingForAttribute(forAttributeValue: string) {
  return `
Expected to find an input element matching the "for" attribute on your label, but we could not locate that input element.

for attribute found: "${forAttributeValue}"

Make sure you have an input element with an id matching "${forAttributeValue}", otherwise this label
will not be able to be properly associated with the corresponding input.
`
}
