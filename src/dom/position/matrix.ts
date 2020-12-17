/**
 * Class for dealing with CSS Transform matrices.
 * Supports relative updates being made to a matrix from multiple pieces of
 * code without them over-riding each other (unless explicitly desired).
 */
import { Numeric } from '../../types';
import { Vector2d } from '../../mathf/geometry/vector-2d';
import { ArrayMap } from '../../map/array';
import { ComputedStyleService } from '../computed-style-service';
import { Raf } from '../..';

// Tracks desired changes to element matrices for the next frame
const matrixChangesByElement: ArrayMap<HTMLElement, Matrix> = new ArrayMap();
// Tracks starting state of each matrix for the current frame
const preChangeMatrixByElement: Map<HTMLElement, Matrix> = new Map();

// For figuring out how much to trim off strings to get at the values
const STYLE_STRING_PREFIX = 'matrix(';
const STYLE_STRING_PREFIX_LENGTH = STYLE_STRING_PREFIX.length;

// Optimization to minimize DOM queries where possible
const computedStyleService = ComputedStyleService.getSingleton();

export class Matrix {
  static parseFromString(str: string): Matrix {
    if (str === 'none' || !str.length) {
      return new Matrix();
    }
    return new Matrix(...str.slice(STYLE_STRING_PREFIX_LENGTH, -1).split(','));
  }

  static fromElementTransform(element: Element): Matrix {
    return Matrix.parseFromString(
        computedStyleService.getComputedStyle(element).transform);
  }

  // Applies all matrix changes to an element, allowing multiple effects to
  // collaborate on transform values for a single element
  private static mutateElementWithMatrixChanges(element: HTMLElement) {
    const raf = new Raf();
    raf.write(() => {
      const originalMatrix = preChangeMatrixByElement.get(element);
      const changes = matrixChangesByElement.get(element);

      // Do nothing if the changes have already been applied for this element
      if (changes.length < 1) {
        return;
      }

      // Clear the cache
      matrixChangesByElement.delete(element);

      // Consolidate and apply the changes
      const finalMatrix =
          changes.reduce(
              (accumulationMatrix, changeMatrix) => {
                return accumulationMatrix.applyDifference(changeMatrix);
              },
              originalMatrix);
      finalMatrix.applyToElementTransform(element);

      raf.postWrite(() => {
        preChangeMatrixByElement.clear();
        matrixChangesByElement.clear();
      });
    });
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

  /**
   * Return a re-positioned copy of the current Matrix
   */
  setPosition(position: Vector2d): Matrix {
    return new Matrix(
        this.a, this.b, this.c, this.d, position.getX(), position.getY());
  }

  /**
   * Return acopy of the current Matrix, moved to the given X coordinate
   */
  setTranslateX(value: number): Matrix {
    return new Matrix(this.a, this.b, this.c, this.d, value, this.ty);
  }

  /**
   * Return acopy of the current Matrix, moved to the given Y coordinate
   */
  setTranslateY(value: number): Matrix {
    return new Matrix(this.a, this.b, this.c, this.d, this.tx, value);
  }

  /**
   * Returns copy of the current Matrix with the given scale value instead of
   * the current scale value.
   */
  setScale(scale: number) {
    return new Matrix(scale, this.b, this.c, scale, this.tx, this.ty);
  }

  toCSSString(): string {
    const values = [this.a, this.b, this.c, this.d, this.tx, this.ty];
    return `matrix(${values.join(',')})`;
  }

  applyToElementTransform(element: HTMLElement): void {
    element.style.transform = this.toCSSString();
  }

  /**
   * Applies current matrix to an element as a change over the given original
   * matrix.
   */
  applyToElementTransformAsChange(
      element: HTMLElement,
      originalMatrix: Matrix
  ): void {
    matrixChangesByElement.get(element)
        .push(this.getDifference(originalMatrix));
    preChangeMatrixByElement.set(element, originalMatrix);
    Matrix.mutateElementWithMatrixChanges(element);
  }

  /**
   * Returns a copy of the current Matrix after applying the given matrix.
   */
  applyDifference(differenceMatrix: Matrix): Matrix {
    return new Matrix(
        this.a + differenceMatrix.a,
        this.b + differenceMatrix.b,
        this.c + differenceMatrix.c,
        this.d + differenceMatrix.d,
        this.tx + differenceMatrix.tx,
        this.ty + differenceMatrix.ty
    );
  }

  /**
   * Return the difference between the current matrix and the given matrix.
   */
  getDifference(matrix: Matrix): Matrix {
    return new Matrix(
        this.a - matrix.a,
        this.b - matrix.b,
        this.c - matrix.c,
        this.d - matrix.d,
        this.tx - matrix.tx,
        this.ty - matrix.ty
    );
  }
}
