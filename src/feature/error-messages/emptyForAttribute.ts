export default function emptyForAttribute() {
  return `
When using our uncheck helpers, we expect you to have the correct semantic layout for a checkbox on your page.
this includes the following:

1.) a label element with matching text, with a "for" attribute set (or htmlFor, when using react)
2.) an input with type="checkbox" which has an id that matches the corresponding for tag on the label

We were able to find a label matching the text you gave us, but the for attribute found on it
was blank. Make sure to add a for attribute, and point it to the id of your corresponding checkbox
`
}
