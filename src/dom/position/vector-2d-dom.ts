import { Matrix } from './matrix';
import { Vector2d } from '../../mathf/geometry/vector-2d';

export class Vector2dDom extends Vector2d {
  static fromElementOffset<T extends Vector2dDom>(element: HTMLElement): T {
    const offsetParent: HTMLElement = <HTMLElement>element.offsetParent;
    return <T>new this(element.offsetLeft, element.offsetTop);
  }

  static fromMatrix<T extends Vector2dDom>(matrix: Matrix): T {
    return <T>new this(matrix.getTranslateX(), matrix.getTranslateY());
  }

  static fromElementScroll<T extends Vector2dDom>(element: Element): T {
    return <T>new this(element.scrollLeft, element.scrollTop);
  }

  static fromElementTransform<T extends Vector2dDom>(element: Element): T {
    return this.fromMatrix(Matrix.fromElementTransform(element));
  }

  static fromWheelEvent<T extends Vector2dDom>(e: WheelEvent): T {
    return <T>new this(e.deltaX, e.deltaY);
  }

  positionElement(element: HTMLElement): void {
    element.style.left = `${this.getX()}px`;
    element.style.top = `${this.getY()}px`;
  }

  positionElementByTranslation(element: HTMLElement): void {
    element.style.transform = `translate(${this.getX()}px, ${this.getY()}px)`;
  }
}
