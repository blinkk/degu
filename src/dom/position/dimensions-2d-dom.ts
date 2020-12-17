import { Dimensions2d } from '../../mathf/geometry/dimensions-2d';
import { getScrollElement } from '../get-scroll-element';

/**
 * Version of Dimenions2d with various DOM specific helper functions.
 */
export class Dimensions2dDom extends Dimensions2d {
  static fromCanvas<T extends Dimensions2dDom>(
      element: HTMLCanvasElement = null
  ): T {
    return <T>new this(element.width, element.height);
  }

  static fromVideo<T extends Dimensions2dDom>(
      element: HTMLVideoElement = null
  ): T {
    return <T>new this(element.videoWidth, element.videoHeight);
  }

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

  static fromScrollElementClient<T extends Dimensions2dDom>() {
    return <T>new this(
        getScrollElement().clientWidth, getScrollElement().clientHeight);
  }

  static fromInnerWindow<T extends Dimensions2dDom>() {
    return <T>new this(window.innerWidth, window.innerHeight);
  }

  sizeElement(element: HTMLElement): void {
    element.style.width = `${this.getWidth()}px`;
    element.style.height = `${this.getHeight()}px`;
  }
}
