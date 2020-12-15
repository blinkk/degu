import { CachedElementVector } from '../cached-element-vector';
import { Dimensions2dDom } from './dimensions-2d-dom';

export class WindowDimensions extends CachedElementVector<Dimensions2dDom> {
  static getForElement(use: any, args: any[] = null): WindowDimensions {
    if (args) {
      throw new Error('WindowDimensions should not be used with elements');
    }
    // Ignore args.
    return <WindowDimensions>CachedElementVector.getForElement.bind(this)(use);
  }

  static getSingleton(use: any): WindowDimensions {
    return <WindowDimensions>CachedElementVector.getSingleton.bind(this)(use);
  }
  protected static VectorClass: typeof Dimensions2dDom = Dimensions2dDom;

  constructor(element: HTMLElement = null) {
    super(element);
  }

  protected getValues(): number[] {
    return Dimensions2dDom.fromInnerWindow().getValues();
  }
}
