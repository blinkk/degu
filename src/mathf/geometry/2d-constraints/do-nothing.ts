import { Vector2d } from '../vector-2d';
import { Constraint2d } from './interface';

class DoNothingConstraint implements Constraint2d {
  constrain(delta: Vector2d) {
    return delta;
  }
}

export const DO_NOTHING_CONSTRAINT = new DoNothingConstraint();
