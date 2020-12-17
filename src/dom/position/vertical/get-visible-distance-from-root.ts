import { VisibleDistanceFromRootService } from './visible-distance-from-root-service';

const visibleDistanceFromRootService =
    VisibleDistanceFromRootService.getSingleton();

/**
 * Returns the elements visible distance from the root of the viewport.
 */
export function getVisibleDistanceFromRoot(element: HTMLElement): number {
  return visibleDistanceFromRootService.getVisibleDistanceFromRoot(element);
}
