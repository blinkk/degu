import { Numeric } from '../../types';
import { Vector2d } from '../../mathf/geometry/vector-2d';
import { ArrayMap } from '../../map/array';
import { ComputedStyleService } from '../style/computed-style-service';
import { Constraint2d } from '../../mathf/geometry/2d-constraints/interface';
import { Raf } from '../../raf/raf';
import { reduce } from '../../iterable-iterator/reduce';

const matrixChangesByElement: ArrayMap<HTMLElement, Matrix> = new ArrayMap();
const preChangeMatrixByElement: Map<HTMLElement, Matrix> = new Map();
const STYLE_STRING_PREFIX = 'matrix(';
const STYLE_STRING_PREFIX_LENGTH = STYLE_STRING_PREFIX.length;

const computedStyleService = ComputedStyleService.getSingleton();

export class Matrix {

  get translateX(): number {
    return this.tx;
  }

  get translateY(): number {
    return this.ty;
  }

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

      matrixChangesByElement.delete(element);
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

  translate(vector: {x: number, y: number}): Matrix {
    const newX = this.tx + vector.x;
    const newY = this.ty + vector.y;
    return new Matrix(this.a, this.b, this.c, this.d, newX, newY);
  }

  setPosition(position: Vector2d): Matrix {
    return new Matrix(
        this.a, this.b, this.c, this.d, position.getX(), position.getY());
  }

  setTranslateX(value: number): Matrix {
    return new Matrix(this.a, this.b, this.c, this.d, value, this.ty);
  }

  setTranslateY(value: number): Matrix {
    return new Matrix(this.a, this.b, this.c, this.d, this.tx, value);
  }

  applyPositionConstraint(constraint: Constraint2d): Matrix {
    const position = constraint.constrain(new Vector2d(this.tx, this.ty));
    return this.setPosition(position);
  }

  applyPositionConstraints(constraints: Constraint2d[]): Matrix {
    const position =
        constraints.reduce(
            (position: Vector2d, constraint: Constraint2d) => {
              return constraint.constrain(position);
            },
            new Vector2d(this.tx, this.ty));
    return this.setPosition(position);
  }

  applyPositionConstraintsFromIterableIterator(
      constraints: IterableIterator<Constraint2d>
  ): Matrix {
    const position =
        reduce(
            constraints,
            (position: Vector2d, constraint: Constraint2d) => {
              return constraint.constrain(position);
            },
            new Vector2d(this.tx, this.ty));
    return this.setPosition(position);
  }

  set2dTranslation(translation: Vector2d) {
    return new Matrix(
        this.a, this.b, this.c, this.d, translation.getX(), translation.getY());
  }

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

  applyToElementTransformAsChange(
      element: HTMLElement,
      originalMatrix: Matrix
  ): void {
    matrixChangesByElement.get(element)
        .push(this.getDifference(originalMatrix));
    preChangeMatrixByElement.set(element, originalMatrix);
    Matrix.mutateElementWithMatrixChanges(element);
  }

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
