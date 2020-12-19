export class Dimensions2dDom {
  static fromElementOffset(element: HTMLElement) {
    return new Dimensions2dDom(element.offsetWidth, element.offsetHeight);
  }
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  equals(candidate: Dimensions2dDom) {
    return this.width === candidate.width &&
        this.height === candidate.height;
  }

  getHypotenuseLength() {
    return Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2));
  }
}
