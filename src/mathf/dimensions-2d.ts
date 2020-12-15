import { Vector } from './vector';
import { SCROLL_ELEMENT } from '../dom/scroll-element';
import { ROOT_ELEMENT } from '../dom/root-element';

export class Dimensions2d extends Vector {
  get width(): number {
    return this.x;
  }

  get height(): number {
    return this.y;
  }

  static fromCanvas<T extends Dimensions2d>(
      element: HTMLCanvasElement = null
  ): T {
    return <T>new this(element.width, element.height);
  }

  static fromVideo<T extends Dimensions2d>(
      element: HTMLVideoElement = null
  ): T {
    return <T>new this(element.videoWidth, element.videoHeight);
  }

  static fromElementOffset<T extends Dimensions2d>(
      element: HTMLElement = null
  ): T {
    if (element) {
      return <T>new this(element.offsetWidth, element.offsetHeight);
    } else {
      return this.fromInnerWindow();
    }
  }

  static fromRootElement<T extends Dimensions2d>() {
    return <T>new this(ROOT_ELEMENT.clientWidth, ROOT_ELEMENT.clientHeight);
  }

  static fromScrollElementClient<T extends Dimensions2d>() {
    return <T>new this(SCROLL_ELEMENT.clientWidth, SCROLL_ELEMENT.clientHeight);
  }

  static fromInnerWindow<T extends Dimensions2d>() {
    return <T>new this(window.innerWidth, window.innerHeight);
  }

  constructor(width: number = 0, height: number = 0) {
    super(width, height);
  }

  sizeElement(element: HTMLElement): void {
    element.style.width = `${this.width}px`;
    element.style.height = `${this.height}px`;
  }

  getArea(): number {
    return this.width * this.height;
  }
}
