/**
 * Handle variations between browsers that are relevant when measuring the
 * position of elements relative to one another.
 */
export function getScrollElement(): Element {
  return document.scrollingElement || document.documentElement;
}
