/**
 * The matchers that act on the page (toClickSelector, toClickButton,
 * toClickLink, toClick, toCheck, toUncheck, toFill, toSelect) have no negated
 * meaning. Their registration refuses .not before one runs (refuseNegation),
 * so none of them waits, acts, or passes after the timeout under .not.
 */

// The part of Vitest's matcher context refuseNegation reads.
export interface NegationState {
  isNot: boolean
}

/** Throw the matcher's "Cannot negate" error when it was called with .not. */
export function refuseNegation(state: NegationState, message: string) {
  if (state.isNot) throw new Error(message)
}

/**
 * An action matcher's passing result. Vitest shows a passing result's message
 * only under .not, which refuseNegation has already refused, so it is never
 * shown.
 */
export function actionPassed() {
  return { pass: true, message: () => '' }
}
