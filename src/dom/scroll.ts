// Can be cached on load since the browser isn't going to change at run time.
import { CachedElementVector } from './cached-element-vector';
import { Vector2d } from '../mathf/geometry/vector-2d';
import { Dimensions } from './position/dimensions';
import { WindowDimensions } from './position/window-dimensions';
import { arrayf } from '../arrayf/arrayf';
import { getScrollElement } from './get-scroll-element';

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
        Dimensions.getForElement(this, [getScrollElement()]);
  }

  getPosition(): Vector2d {
    return this.getLastValue();
  }

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

  isScrollingDown(): boolean {
    return this.getDelta().getY() < 0;
  }

  isScrollingUp(): boolean {
    return this.getDelta().getY() > 0;
  }

  isScrollingRight(): boolean {
    return this.getDelta().getX() > 0;
  }

  isScrollingLeft(): boolean {
    return this.getDelta().getX() < 0;
  }

  destroy(use: any) {
    super.destroy(use);
    this.windowDimensions.destroy(this);
    this.scrollElementDimensions.destroy(this);
  }

  protected getValues(): number[] {
    return [this.getScrollX_(), this.getScrollY_()];
  }

  private getScrollX_(): number {
    if (this.element) {
      return this.element.scrollLeft;
    } else {
      return window.pageXOffset || getScrollElement().scrollLeft;
    }
  }

  private getScrollY_(): number {
    if (this.element) {
      return this.element.scrollTop;
    } else {
      return window.pageYOffset || getScrollElement().scrollTop;
    }
  }
}
