/**
 * Class for dealing with CSS Transform matrices.
 * Supports relative updates being made to a matrix from multiple pieces of
 * code without them over-riding each other (unless explicitly desired).
 */
import { dom } from './dom';

export class MatrixDom {
  static parseFromString(str: string): MatrixDom {
    if (str === 'none' || !str.length) {
      return new MatrixDom();
    }
    const values =
        str.slice('matrix('.length, -1)
            .split(',')
            .map((value) => parseFloat(value));
    if (values.length !== 6 || values.some((value) => isNaN((value)))) {
      throw new Error('Invalid matrix passed to MatrixDom.parseFromString');
    }
    return new MatrixDom(...values);
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
      a: number = 1,
      b: number = 0,
      c: number = 0,
      d: number = 1,
      tx: number = 0,
      ty: number = 0
  ) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
  }

  getTranslateX(): number {
    return this.tx;
  }

  getTranslateY(): number {
    return this.ty;
  }
}
