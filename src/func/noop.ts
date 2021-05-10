/**
 * Does nothing. Use when you need to do nothing and want to make it clear that
 * you fully understood you were doing nothing and really truly intended to do
 * nothing.
 *
 * It does nothing, but on purpose and doesn't look like a bug or error.
 * It exists solely for readability.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function noop(...args: any[]): any {
  // Purposefully empty.
}
