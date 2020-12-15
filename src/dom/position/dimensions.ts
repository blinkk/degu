import { CachedElementVector } from '../cached-element-vector';
import { Dimensions2dDom } from './dimensions-2d-dom';
import { getAncestorDimensions } from './get-ancestor-dimensions';

export class Dimensions extends CachedElementVector<Dimensions2dDom> {
  static getForElement(use: any, args: any[] = [null]): Dimensions {
    return <Dimensions>CachedElementVector.getForElement.bind(this)(use, args);
  }

  static getSingleton(use: any): Dimensions {
    return <Dimensions>CachedElementVector.getSingleton.bind(this)(use);
  }
  protected static VectorClass: typeof Dimensions2dDom = Dimensions2dDom;

  constructor(element: HTMLElement = null) {
    super(element);
  }

  getDimensions(): Dimensions2dDom {
    return this.getLastValue();
  }

  protected getValues(): number[] {
    return getAncestorDimensions(this.element).getValues();
  }
}
