import { Dimensions2d } from '../../mathf/geometry/dimensions-2d';

/**
 * Version of Dimenions2d with various DOM specific helper functions.
 */
export class Dimensions2dDom extends Dimensions2d {
  static fromElementOffset<T extends Dimensions2dDom>(
      element: HTMLElement = null
  ): T {
    if (element) {
      return <T>new this(element.offsetWidth, element.offsetHeight);
    } else {
      return this.fromInnerWindow();
    }
  }

  static fromRootElement<T extends Dimensions2dDom>() {
    return <T>new this(
        document.documentElement.clientWidth,
        document.documentElement.clientHeight);
  }

  static fromInnerWindow<T extends Dimensions2dDom>() {
    return <T>new this(window.innerWidth, window.innerHeight);
  }
}
