import { MatrixDom } from './matrix-dom';
import { Vector2d } from '../../mathf/geometry/vector-2d';

/**
 * DOM version of Vector2d with various DOM-specific helper functions.
 */
export class Vector2dDom extends Vector2d {
  /**
   * Returns a vector matching the element's offsetLeft and offsetTop
   */
  static fromElementOffset<T extends Vector2dDom>(element: HTMLElement): T {
    const offsetParent: HTMLElement = <HTMLElement>element.offsetParent;
    return <T>new this(element.offsetLeft, element.offsetTop);
  }

  static fromMatrix<T extends Vector2dDom>(matrix: MatrixDom): T {
    return <T>new this(matrix.getTranslateX(), matrix.getTranslateY());
  }

  static fromElementScroll<T extends Vector2dDom>(element: Element): T {
    return <T>new this(element.scrollLeft, element.scrollTop);
  }

  static fromElementTransform<T extends Vector2dDom>(element: Element): T {
    return this.fromMatrix(MatrixDom.fromElementTransform(element));
  }

  static fromWheelEvent<T extends Vector2dDom>(e: WheelEvent): T {
    return <T>new this(e.deltaX, e.deltaY);
  }

  /**
   * Sets an element's left and top style values based on the vector's X and Y.
   */
  positionElement(element: HTMLElement): void {
    element.style.left = `${this.getX()}px`;
    element.style.top = `${this.getY()}px`;
  }

  /**
   * Sets the element's transform to a translate based on the vector's X and Y.
   */
  positionElementByTranslation(element: HTMLElement): void {
    element.style.transform = `translate(${this.getX()}px, ${this.getY()}px)`;
  }
}
