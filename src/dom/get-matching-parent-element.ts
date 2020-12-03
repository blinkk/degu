/**
 * Returns a parent element of the given element that returns true for the
 * given test function.
 */
export function getMatchingParentElement(
    element: HTMLElement, testFunction: (element: HTMLElement) => boolean
): HTMLElement {
  let candidate = element.parentElement;
  while (candidate) {
    if (testFunction(candidate)) {
      return candidate;
    }
    candidate = candidate.parentElement;
  }
  return undefined;
}
