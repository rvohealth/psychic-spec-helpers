export default function evaluationFailure(actual: any) {
  return {
    pass: false,
    actual,
  }
}
