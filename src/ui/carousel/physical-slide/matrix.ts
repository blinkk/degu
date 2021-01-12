import { Vector } from '../../../mathf/vector';
import { dom } from '../../..';

const STYLE_STRING_PREFIX = 'matrix(';
const STYLE_STRING_PREFIX_LENGTH = STYLE_STRING_PREFIX.length;

type Numeric = number|string;

export class Matrix {

  static parseFromString(str: string): Matrix {
    if (str === 'none' || !str.length) {
      return new Matrix();
    }
    return new Matrix(...str.slice(STYLE_STRING_PREFIX_LENGTH, -1).split(','));
  }

  static fromElementTransform(element: Element): Matrix {
    return Matrix.parseFromString(
      dom.getComputedStyle(<HTMLElement>element).transform);
  }
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly tx: number;
  readonly ty: number;

  constructor(
    a: Numeric = 1,
    b: Numeric = 0,
    c: Numeric = 0,
    d: Numeric = 1,
    tx: Numeric = 0,
    ty: Numeric = 0
  ) {
    this.a = parseFloat(<string>a);
    this.b = parseFloat(<string>b);
    this.c = parseFloat(<string>c);
    this.d = parseFloat(<string>d);
    this.tx = parseFloat(<string>tx);
    this.ty = parseFloat(<string>ty);
  }

  getTranslateX(): number {
    return this.tx;
  }

  getTranslateY(): number {
    return this.ty;
  }

  getTranslation(): Vector {
    return new Vector(this.tx, this.ty);
  }

  translate(vector: {x: number, y: number}): Matrix {
    const newX = this.tx + vector.x;
    const newY = this.ty + vector.y;
    return new Matrix(this.a, this.b, this.c, this.d, newX, newY);
  }

  setPosition(position: {x: number, y: number}): Matrix {
    return new Matrix(this.a, this.b, this.c, this.d, position.x, position.y);
  }

  toCSSString(): string {
    const values = [this.a, this.b, this.c, this.d, this.tx, this.ty];
    return `matrix(${values.join(',')})`;
  }

  applyToElementTransform(element: HTMLElement): void {
    element.style.transform = this.toCSSString();
  }
}
