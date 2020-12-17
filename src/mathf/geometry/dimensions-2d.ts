import { MultiDimensionalVector } from './multi-dimensional-vector';

export class Dimensions2d extends MultiDimensionalVector {

  constructor(width: number = 0, height: number = 0) {
    super(width, height);
  }
  getWidth(): number {
    return this.values[0];
  }

  getHeight(): number {
    return this.values[1];
  }

  getArea(): number {
    return this.getWidth() * this.getHeight();
  }
}
