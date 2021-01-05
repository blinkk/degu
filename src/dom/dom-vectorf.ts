import { MatrixDom } from './matrix-dom';
import { Vector } from '../mathf/vector';

/**
 * DOM version of Vector2d with various DOM-specific helper functions.
 */
export class domVectorf {
  static fromMatrix<T extends Vector>(matrix: MatrixDom): T {
    return <T>new Vector(matrix.getTranslateX(), matrix.getTranslateY());
  }

  static fromElementTransform<T extends Vector>(element: Element): T {
    return this.fromMatrix(MatrixDom.fromElementTransform(element));
  }
}
