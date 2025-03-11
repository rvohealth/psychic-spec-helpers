export default function metaOrControlKey(): 'Meta' | 'Control' {
  // Use 'Meta' for macOS and 'Control' for Windows/Linux
  return process.platform === 'darwin' ? 'Meta' : 'Control'
}
