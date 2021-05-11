import {Vector} from '../mathf/vector';

/**
 * @unstable
 */
export class Camera {
  public position: Vector;
  public target: Vector;

  constructor() {
    this.position = Vector.ZERO;
    this.target = Vector.ZERO;
  }
}
