/**
 * Why a label's for attribute led toCheck or toUncheck to no control: no
 * element has that id (or none that meets the visible or hidden option), or
 * the value is not usable as a CSS id selector and no checkbox, radio or
 * switch is labelled with the text.
 */
export default function missingForAttribute(
  forAttributeValue: string,
  why:
    | { reason: 'labelControlMissing'; option?: 'visible' | 'hidden' }
    | { reason: 'invalidFor'; text: string }
) {
  const cause =
    why.reason === 'invalidFor'
      ? `"${forAttributeValue}" is not usable as a CSS id selector, and no checkbox, radio or switch is labelled "${why.text}"`
      : why.option
        ? `we could not locate a ${why.option} element with that id`
        : 'we could not locate that input element'
  const wanted =
    why.reason === 'invalidFor'
      ? 'a checkbox, radio or switch'
      : why.option
        ? `a ${why.option} input element`
        : 'an input element'

  return `
Expected to find an input element matching the "for" attribute on your label, but ${cause}.

for attribute found: "${forAttributeValue}"

Make sure you have ${wanted} with an id matching "${forAttributeValue}", otherwise this label
will not be able to be properly associated with the corresponding input.
`
}
