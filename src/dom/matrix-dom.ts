/**
 * Class for dealing with CSS Transform matrices.
 * Supports relative updates being made to a matrix from multiple pieces of
 * code without them over-riding each other (unless explicitly desired).
 */
import { dom } from './dom';

type Numeric = number|string; // Number that could be represented as string

export class MatrixDom {
  static parseFromString(str: string): MatrixDom {
    if (str === 'none' || !str.length) {
      return new MatrixDom();
    }
    return new MatrixDom(...str.slice('matrix('.length, -1).split(','));
  }

  static fromElementTransform(element: Element): MatrixDom {
    const transform = dom.getStyle(element).transform;
    return MatrixDom.parseFromString(transform);
  }

  // Values a, b, c, d, tx, ty as per CSS transforms
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly tx: number;
  readonly ty: number;

  // Use numeric to allow strings or numbers
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
}
