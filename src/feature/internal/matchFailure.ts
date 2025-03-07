export default function matchFailure(message: string | ((expected: any) => string)) {
  return {
    pass: false,
    message: (expected: any) => (typeof message === 'string' ? message : message(expected)),
  }
}
