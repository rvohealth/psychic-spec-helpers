export default function emptyForAttribute(text: string) {
  return `
When using our check and uncheck helpers, we expect you to have a semantic layout for a checkbox on your page,
such as the following:

1.) a label element with matching text, with a "for" attribute set (or htmlFor, when using react)
2.) a checkbox, radio or switch which has an id that matches the corresponding for tag on the label

We were able to find a label matching the text you gave us, but it has no for attribute (or a blank one),
and no checkbox, radio or switch is labelled "${text}". Make sure to add a for attribute, and point it
to the id of your corresponding checkbox
`
}
