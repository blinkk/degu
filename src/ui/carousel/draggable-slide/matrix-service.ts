import { Matrix } from './matrix';
import { DefaultMap } from '../../../map/default-map';
import { Raf } from '../../..';
import { Vector } from '../../../mathf/vector';

/**
 * This service is used to coordinate modifications to a transform coming
 * from multiple services. This allows us to stack transform-effecting UI
 * on top of elements without needing to build a separate monolith to manage
 * the interaction between the UI components.
 */
export class MatrixService {
  static getSingleton(): MatrixService {
    return this.singleton = this.singleton || new this();
  }
  private static singleton: MatrixService = null;
  private cleanMatrix: DefaultMap<HTMLElement, Matrix>;
  private alteredMatrix: DefaultMap<HTMLElement, Matrix>;
  private raf: Raf;

  constructor() {
    this.cleanMatrix =
      DefaultMap.usingFunction(
        (element: HTMLElement) => Matrix.fromElementTransform(element));
    this.alteredMatrix =
      DefaultMap.usingFunction(
        (element: HTMLElement) => this.cleanMatrix.get(element));
    this.raf = new Raf(() => this.loop());
  }

  /**
   * Return the state the matrix was in when it was first checked by this
   * service this frame.
   */
  getCleanMatrix(element: HTMLElement): Matrix {
    return this.cleanMatrix.get(element);
  }

  /**
   * Get the matrix that will be applied to the element during the
   * write step of the Raf loop.
   */
  getAlteredMatrix(element: HTMLElement): Matrix {
    return this.alteredMatrix.get(element);
  }

  /**
   * Get the X translation that will be applied to the element during the
   * write step of the Raf loop.
   */
  getAlteredXTranslation(element: HTMLElement): number {
    return this.getAlteredMatrix(element).getTranslateX() -
      this.getCleanMatrix(element).getTranslateX();
  }

  /**
   * Get the Y translation that will be applied to the element during the
   * write step of the Raf loop.
   */
  getAlteredYTranslation(element: HTMLElement): number {
    return this.getAlteredMatrix(element).getTranslateY() -
        this.getCleanMatrix(element).getTranslateY();
  }

  /**
   * Get the translation that will be applied to the element during the
   * write step of the Raf loop.
   */
  getAlteredTranslation(element: HTMLElement): Vector {
    return new Vector(
        this.getAlteredXTranslation(element),
        this.getAlteredYTranslation(element));
  }

  /**
   * Translate the given element by the given Vector
   */
  translate(element: HTMLElement, x: number, y: number): void {
    this.alteredMatrix.set(
      element, this.alteredMatrix.get(element).translate(x, y));
    this.raf.start();
  }

  /**
   * Apply all scheduled transforms.
   */
  private loop() {
    this.raf.write(() => {
      const entries = this.alteredMatrix.entries();

      Array.from(entries).forEach(
        ([element, alteredMatrix]) => {
          alteredMatrix.applyToElementTransform(element);
        });

      this.raf.postWrite(() => {
        this.cleanMatrix.clear();
        this.alteredMatrix.clear();
        this.raf.stop();
      });
    });
  }
}
