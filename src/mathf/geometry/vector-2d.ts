import { MultiDimensionalVector } from './multi-dimensional-vector';
import { mathf } from '../mathf';

export class Vector2d extends MultiDimensionalVector {
  constructor(x: number = 0, y: number = 0, ...args: number[]) {
    super(x, y, ...args);
  }

  getX(): number {
    return this.getValues()[0];
  }

  getY(): number {
    return this.getValues()[1];
  }

  zeroY(): Vector2d {
    return new Vector2d(this.getX(), 0);
  }

  zeroX(): Vector2d {
    return new Vector2d(0, this.getY());
  }

  trendsHorizontal() {
    return mathf.absMax(this.getX(), this.getY()) === Math.abs(this.getX());
  }

  trendsVertical() {
    return mathf.absMax(this.getX(), this.getY()) === Math.abs(this.getY());
  }

  toString(): string {
    return `X: ${this.getX()}, Y: ${this.getY()}`;
  }
}
