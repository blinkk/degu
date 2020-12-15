import { NumericRange } from '../numeric-range';
import { arrayf } from '../../arrayf/arrayf';
import { mathf } from '../mathf';

export class MultiDimensionalVector {
  static add<T extends MultiDimensionalVector>(...vectors: T[]): T {
    const values: number[][] =
        vectors.map((vector: T) => vector.getValues());
    const summedValues: number[] =
        arrayf.zip<number>(...values)
            .map((zippedVals: number[]) => mathf.sum(...zippedVals));
    return <T>new this(...summedValues);
  }

  static invert<T extends MultiDimensionalVector>(vector: T): T {
    return vector.invert();
  }

  static clamp<T extends MultiDimensionalVector>(
      vector: T, ...ranges: NumericRange[]
  ): T {
    const zippedValuesAndRanges: Array<[number, NumericRange]> =
        <Array<[number, NumericRange]>>(
            arrayf.zip<number|NumericRange>(vector.getValues(), ranges));
    const clampedValues: number[] =
        zippedValuesAndRanges.map(
            ([value, range]: [number, NumericRange]) => {
              return range ? range.clamp(value) : value;
            });
    return <T>new this(...clampedValues);
  }

  static subtract<T extends MultiDimensionalVector>(minuend: T, ...subtrahends: T[]): T {
    return this.add(
        minuend, ...subtrahends.map((subtrahend: T) => subtrahend.invert()));
  }

  static sumDeltas<T extends MultiDimensionalVector>(...vectors: T[]): T {
    return this.subtract(vectors[0], vectors.slice(-1)[0]);
  }

  static getDeltas<T extends MultiDimensionalVector>(...vectors: T[]): T[] {
    let previous: T = vectors[0];
    return <T[]>vectors.slice(1).map(
        (next: T) => {
          const result = this.subtract(next, previous);
          previous = next;
          return result;
        });
  }

  static fromMultiDimensionalVector<T extends MultiDimensionalVector>(vector: MultiDimensionalVector): T {
    return <T>new this(...vector.getValues());
  }

  static scale<T extends MultiDimensionalVector>(vector: T, amount: number): T {
    return <T>new this(...vector.getValues().map((value) => value * amount));
  }

  static areEqual<T extends MultiDimensionalVector>(...vectors: T[]): boolean {
    return arrayf.areArrayValuesIdentical(vectors.map((v) => v.getValues()));
  }

  static toNthPower<T extends MultiDimensionalVector>(vector: T, power: number): T {
    return <T> new this(
        ...vector.getValues().map((value) => Math.pow(value, power)));
  }
  ['constructor']: typeof MultiDimensionalVector;
  protected readonly values: number[];

  constructor(...values: number[]) {
    this.values = values;
  }

  /**
   * Returns new vector with same scale, pointing in the same direction as the
   * provided vector. Ensuring that signs of numeric values match between the
   * returned vector and the provided vector.
   */
  alignTo(vector: this): this {
    const zippedValues: number[][] =
        arrayf.zip<number>(this.getValues(), vector.getValues());
    const alignedValues =
        zippedValues
            .map(
                ([originalValue, valueToAlignWith]) => {
                  return Math.abs(originalValue) * Math.sign(valueToAlignWith);
                }
            );
    return <this>new this.constructor(...alignedValues);
  }

  add(...vectors: this[]): this {
    return this.constructor.add(this, ...vectors);
  }

  invert(): this {
    return <this>new this.constructor(...this.getValues().map((val) => -val));
  }

  clamp(...ranges: NumericRange[]): this {
    return this.constructor.clamp(this, ...ranges);
  }

  subtract(...subtrahends: this[]): this {
    return this.constructor.subtract(this, ...subtrahends);
  }

  getValues(): number[] {
    return this.values;
  }

  scale(amount: number): this {
    return this.constructor.scale(this, amount);
  }

  equals(...vectors: this[]): boolean {
    return this.constructor.areEqual(this, ...vectors);
  }

  getLength(): number {
    const squaredValues =
        this.getValues().map((value) => Math.pow(value, 2));
    return Math.sqrt(mathf.sum(...squaredValues));
  }

  setLength(value: number): this {
    const currentLength = this.getLength();
    const scale = value / currentLength;
    return this.scale(scale);
  }

  clampLength(length: number): this {
    const currentLength = this.getLength();
    if (currentLength > length) {
      return this.setLength(length);
    } else {
      return this;
    }
  }

  multiply(vector: this): this {
    return <this>new this.constructor(
        ...arrayf.zip<number>(this.getValues(), vector.getValues())
            .map(([a, b]) => a * b));
  }

  divide(vector: this): this {
    return <this>new this.constructor(
        ...arrayf.zip<number>(this.getValues(), vector.getValues())
            .map(([a, b]) => a / b));
  }

  toExponent(pow: number): this {
    return <this>new this.constructor(
        ...this.getValues().map((value) => Math.pow(value, pow)));
  }

  asRanges(): NumericRange[] {
    return this.getValues()
        .map((value) => new NumericRange(Math.min(0, value), Math.max(0, value)));
  }

  toNthPower(power: number): this {
    return this.constructor.toNthPower(this, power);
  }
}
