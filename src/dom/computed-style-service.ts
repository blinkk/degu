import { DynamicDefaultMap } from '../map/dynamic-default';
import { Raf } from '..';

export class ComputedStyleService {

  static getSingleton(): ComputedStyleService {
    return this.singleton = this.singleton || new this();
  }
  private static singleton: ComputedStyleService = null;
  private readonly raf: Raf;
  private computedStyle: DynamicDefaultMap<Element, CSSStyleDeclaration>;

  constructor() {
    this.raf = new Raf(() => this.loop());
    this.computedStyle =
        DynamicDefaultMap.usingFunction(
            (element: Element) => window.getComputedStyle(element));
    this.init();
  }

  getComputedStyle(element: Element) {
    return this.computedStyle.get(element);
  }

  private init() {
    this.raf.start();
  }

  private loop() {
    this.raf.postWrite(() => this.computedStyle.clear());
  }
}
