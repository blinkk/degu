// Can be cached on load since the browser isn't going to change at run time.
import { CachedElementVector } from './cached-element-vector';
import { Vector2d } from '../mathf/geometry/vector-2d';
import { Dimensions } from './position/dimensions';
import { WindowDimensions } from './position/window-dimensions';
import { arrayf } from '../arrayf/arrayf';
import { dom } from './dom';

/**
 * Caches the scrolling element's scroll position.
 */
export class Scroll extends CachedElementVector<Vector2d> {

  static getForElement(use: any, args: any[] = [null]): Scroll {
    return <Scroll>CachedElementVector.getForElement.bind(this)(use, args);
  }

  static getSingleton(use: any): Scroll {
    return <Scroll>CachedElementVector.getSingleton.bind(this)(use);
  }
  protected static VectorClass: typeof Vector2d = Vector2d;
  private windowDimensions: WindowDimensions;
  private scrollElementDimensions: Dimensions;

  constructor(element: HTMLElement = null) {
    super(element);
    this.windowDimensions = WindowDimensions.getSingleton(this);
    this.scrollElementDimensions =
        Dimensions.getForElement(this, [dom.getScrollElement()]);
  }

  /**
   * Returns the current scroll position
   */
  getPosition(): Vector2d {
    return this.getLastValue();
  }

  /**
   * Returns how much of the document has been scrolled
   */
  getScrollPercent(): Vector2d {
    const scrollableDimensions: number[] =
        this.scrollElementDimensions
            .getLastValue()
            .subtract(this.windowDimensions.getLastValue())
            .getValues();
    const scrollPositions: number[] = this.getValues();
    const zippedValues: Array<[number, number]> =
        <Array<[number, number]>>(
            arrayf.zip(scrollPositions, scrollableDimensions));
    return new Vector2d(
        ...zippedValues.map(([pos, len]: [number, number]) => pos / len));
  }

  dispose(use: any) {
    super.dispose(use);
    this.windowDimensions.dispose(this);
    this.scrollElementDimensions.dispose(this);
  }

  protected getValues(): number[] {
    return [this.getScrollX(), this.getScrollY()];
  }

  private getScrollX(): number {
    if (this.element) {
      return this.element.scrollLeft;
    } else {
      return window.pageXOffset || dom.getScrollElement().scrollLeft;
    }
  }

  private getScrollY(): number {
    if (this.element) {
      return this.element.scrollTop;
    } else {
      return window.pageYOffset || dom.getScrollElement().scrollTop;
    }
  }
}
