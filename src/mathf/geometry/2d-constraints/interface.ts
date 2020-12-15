import { Vector2d } from '../vector-2d';

export interface Constraint2d {
  constrain(delta: Vector2d): Vector2d;
}
