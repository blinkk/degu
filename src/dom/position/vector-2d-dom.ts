import { MatrixDom } from './matrix-dom';
import { Vector2d } from '../../mathf/geometry/vector-2d';

/**
 * DOM version of Vector2d with various DOM-specific helper functions.
 */
export class Vector2dDom extends Vector2d {
  static fromMatrix<T extends Vector2dDom>(matrix: MatrixDom): T {
    return <T>new this(matrix.getTranslateX(), matrix.getTranslateY());
  }

  static fromElementTransform<T extends Vector2dDom>(element: Element): T {
    return this.fromMatrix(MatrixDom.fromElementTransform(element));
  }
}
