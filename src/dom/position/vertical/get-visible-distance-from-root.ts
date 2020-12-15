import { VisibleDistanceFromRootService } from './visible-distance-from-root-service';

const visibleDistanceFromRootService =
    VisibleDistanceFromRootService.getSingleton();

export function getVisibleDistanceFromRoot(element: HTMLElement): number {
  return visibleDistanceFromRootService.getVisibleDistanceFromRoot(element);
}
