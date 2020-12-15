import { MultiDimensionalVector } from './multi-dimensional-vector';

export class Dimensions2d extends MultiDimensionalVector {
  get width(): number {
    return this.values[0];
  }

  get height(): number {
    return this.values[1];
  }

  constructor(width: number = 0, height: number = 0) {
    super(width, height);
  }

  getArea(): number {
    return this.width * this.height;
  }
}
