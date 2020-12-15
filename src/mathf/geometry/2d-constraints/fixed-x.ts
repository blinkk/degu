import { Constraint2d } from './interface';
import { Vector2d } from '../vector-2d';

export class FixedXConstraint implements Constraint2d {
  constrain(delta: Vector2d) {
    return new Vector2d(0, delta.getY());
  }
}
