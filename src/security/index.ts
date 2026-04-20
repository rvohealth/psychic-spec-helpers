/**
 * Security spec helpers for the Dream + Psychic security audit program.
 *
 * These helpers are intentionally unimplemented in this bootstrap phase.
 * Later phases fill them in:
 *   - Phase 1  → expectBlocksOpenRedirect
 *   - Phase 3  → forgeCookie
 *   - Phase 7  → expectNoMassAssignment, mkProtoPollutionPayload
 *   - Phase 11 → mkPolyglotSvg
 *
 * Phase 2 (CSRF) was SKIPPED: Psychic's SameSite=Strict cookie default blocks
 * classical CSRF at the browser layer for modern browsers, so no server-side
 * CSRF-token primitive is shipped. See SECURITY_AUDIT_TRACKER.md R-002.
 *
 * Tracker: ~/work/dream_and_psychic/SECURITY_AUDIT_TRACKER.md
 */

function notImplemented(name: string): never {
  throw new Error(
    `${name} is a security-audit helper stub; implementation lands in a later audit phase. ` +
      `See ~/work/dream_and_psychic/SECURITY_AUDIT_TRACKER.md.`,
  )
}

export interface OpenRedirectAssertion {
  /** The request-issuing callable whose response Location header must be inspected. */
  request: () => Promise<{ status: number; headers: Record<string, string> }>
  /** The attacker-controlled destination that should be rejected (e.g. 'https://evil.com'). */
  maliciousTarget: string
}

export async function expectBlocksOpenRedirect(_opts: OpenRedirectAssertion): Promise<void> {
  notImplemented('expectBlocksOpenRedirect')
}

export interface MassAssignmentAssertion {
  /** Function that performs a create/update with attacker-controlled body. */
  request: (body: Record<string, unknown>) => Promise<unknown>
  /** Field the attacker is trying to set but should be filtered. */
  protectedField: string
  /** Value the attacker is trying to inject. */
  maliciousValue: unknown
  /** Function that reads back the persisted record for verification. */
  readBack: () => Promise<Record<string, unknown>>
}

export async function expectNoMassAssignment(_opts: MassAssignmentAssertion): Promise<void> {
  notImplemented('expectNoMassAssignment')
}

export function forgeCookie(_opts: { name: string; payload: unknown; secret?: string }): string {
  return notImplemented('forgeCookie')
}

export function mkProtoPollutionPayload(): Record<string, unknown> {
  return notImplemented('mkProtoPollutionPayload')
}

export function mkPolyglotSvg(): Buffer {
  return notImplemented('mkPolyglotSvg')
}
