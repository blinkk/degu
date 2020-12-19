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
    return Math.sqrt(this.width * this.width + this.height * this.height);
  }
}
