import { Vector2d } from '../vector-2d';
import { Constraint2d } from './interface';
import { NumericRange } from '../../numeric-range';

export class BaseConstraint2d implements Constraint2d {

  static applyConstraints(delta: Vector2d, constraints: Constraint2d[]) {
    return constraints.reduce(
      (result, constraint) => constraint.constrain(result), delta);
  }
  private readonly xRange: NumericRange;
  private readonly yRange: NumericRange;

  constructor(xRange: NumericRange, yRange: NumericRange) {
    this.xRange = xRange;
    this.yRange = yRange;
  }

  constrain(delta: Vector2d) {
    return new Vector2d(
      this.xRange.clamp(delta.getX()),
      this.yRange.clamp(delta.getY()));
  }
}
