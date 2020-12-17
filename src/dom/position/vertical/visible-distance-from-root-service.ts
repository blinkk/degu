import { DynamicDefaultMap } from '../../../map/dynamic-default';
import { Scroll } from '../../scroll';
import { Vector2dDom } from '../vector-2d-dom';
import { getStuckDistance } from './get-stuck-distance';
import { dom, Raf } from '../../..';

function isFixed(element: HTMLElement) {
  return dom.getStyle(element).position === 'fixed';
}

function getIgnoreStickyOffset(candidateElement: HTMLElement): number {
  return getBasicOffset(candidateElement) - getStuckDistance(candidateElement);
}

function getBasicOffset(candidateElement: HTMLElement): number {
  return candidateElement.offsetTop +
      Vector2dDom.fromElementTransform(candidateElement).getY();
}

function getVisibleDistanceFromRoot_(
    element: HTMLElement,
    getOffsetFn: (e: HTMLElement) => number
): number {
  let candidateElement = element;
  let y = 0;

  while (candidateElement && candidateElement !== document.body) {
    // Special case for fixed elements
    if (isFixed(candidateElement)) {
      return y + candidateElement.offsetTop;
    } else {
      y += getOffsetFn(candidateElement) -
          candidateElement.scrollTop;
    }
    candidateElement = <HTMLElement>candidateElement.offsetParent;
  }

  const scroll = Scroll.getSingleton(getVisibleDistanceFromRoot_);
  const invertedScroll = scroll.getPosition().invert();
  scroll.destroy(getVisibleDistanceFromRoot_);
  return y + invertedScroll.getY();
}

function getVisibleDistanceFromRoot(
    element: HTMLElement,
    getOffsetFn: (e: HTMLElement) => number
): number {
  if (isFixed(element)) {
    return element.offsetTop;
  }
  return getOffsetFn(element) +
      getVisibleDistanceFromRoot_(<HTMLElement>element.offsetParent, getOffsetFn);
}

export class VisibleDistanceFromRootService {

  static getSingleton(): VisibleDistanceFromRootService {
    return this.singleton = this.singleton || new this();
  }
  private static singleton: VisibleDistanceFromRootService = null;
  private readonly raf: Raf;
  private readonly cache: DynamicDefaultMap<HTMLElement, number>;
  private readonly cacheIgnoringSticky: DynamicDefaultMap<HTMLElement, number>;

  constructor() {
    this.raf = new Raf(() => this.loop());
    this.cache =
        DynamicDefaultMap.usingFunction(
            (element: HTMLElement) => {
              return getVisibleDistanceFromRoot(element, getBasicOffset);
            });
    this.cacheIgnoringSticky =
        DynamicDefaultMap.usingFunction(
            (element: HTMLElement) => {
              return getVisibleDistanceFromRoot(element, getIgnoreStickyOffset);
            });
    this.init();
  }

  getVisibleDistanceFromRoot(element: HTMLElement): number {
    return this.cache.get(element);
  }

  getVisibleDistanceFromRootIgnoringSticky(element: HTMLElement): number {
    return this.cacheIgnoringSticky.get(element);
  }

  private init() {
    this.raf.start();
  }

  private loop() {
    this.raf.postWrite(() => this.clearCaches());
  }

  private clearCaches() {
    this.cache.clear();
    this.cacheIgnoringSticky.clear();
  }
}
