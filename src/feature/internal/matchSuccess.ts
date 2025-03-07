export default function matchSuccess(message: string | ((expected: any) => string)) {
  return {
    pass: true,
    message: (expected: any) => (typeof message === 'string' ? message : message(expected)),
  }
}
