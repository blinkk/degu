import { arrayf } from '../../arrayf/arrayf';
import { mathf } from '../mathf';

/**
 * Determine if each value in the array is the same value.
 */
function containsIdenticalValues<T>(values: T[]): boolean {
  return values.length === 0 ||
      values.every((value) => values[0] === value);
}

/**
 * Determines if the value in each index of each list matches the
 * corresponding value in that same index in each other list.
 * @param lists
 */
function areArrayValuesIdentical<T>(lists: T[][]): boolean {
  // Check all lists have same lengths
  const lengths = lists.map((list: T[]) => list.length);
  if (!containsIdenticalValues(lengths)) {
    return false;
  }
  // Verify that values match across lists
  return arrayf.zip(...lists)
      .every((zippedValues: T[]) => containsIdenticalValues(zippedValues));
}

/**
 * Class for handling vectors of arbitrary dimensions
 */
export class MultiDimensionalVector {
  /**
   * Returns a new vector that is the sum of the given vectors
   */
  static add<T extends MultiDimensionalVector>(...vectors: T[]): T {
    const values: number[][] =
        vectors.map((vector: T) => vector.getValues());
    const summedValues: number[] =
        arrayf.zip<number>(...values)
            .map((zippedVals: number[]) => mathf.sum(...zippedVals));
    return <T>new this(...summedValues);
  }

  /**
   * Returns an inverted version of the given vector
   */
  static invert<T extends MultiDimensionalVector>(vector: T): T {
    return vector.invert();
  }

  /**
   * Returns a new vector that is the difference between the first given vector
   * and subsequent given vectors.
   */
  static subtract<T extends MultiDimensionalVector>(minuend: T, ...subtrahends: T[]): T {
    return this.add(
        minuend, ...subtrahends.map((subtrahend: T) => subtrahend.invert()));
  }

  /**
   * Returns the total difference between the given vectors as a new vector
   */
  static sumDeltas<T extends MultiDimensionalVector>(...vectors: T[]): T {
    return this.subtract(vectors[0], vectors.slice(-1)[0]);
  }

  /**
   * Returns a new vector that is the given vector scaled by the given amount.
   */
  static scale<T extends MultiDimensionalVector>(vector: T, amount: number): T {
    return <T>new this(...vector.getValues().map((value) => value * amount));
  }

  static areEqual<T extends MultiDimensionalVector>(...vectors: T[]): boolean {
    return areArrayValuesIdentical(vectors.map((v) => v.getValues()));
  }

  ['constructor']: typeof MultiDimensionalVector;
  protected readonly values: number[];

  constructor(...values: number[]) {
    this.values = values;
  }

  /**
   * Return a new vector that is the sum of the  given vectors added to the
   * current vector.
   */
  add(...vectors: this[]): this {
    return this.constructor.add(this, ...vectors);
  }

  /**
   * Return an inverted version of the current vector.
   */
  invert(): this {
    return <this>new this.constructor(...this.getValues().map((val) => -val));
  }

  /**
   * Return a new vector resulting from subtracting the given vectors from the
   * current vector.
   */
  subtract(...subtrahends: this[]): this {
    return this.constructor.subtract(this, ...subtrahends);
  }

  /**
   * Return the values contained in the vector as an array of numbers.
   */
  getValues(): number[] {
    return this.values;
  }

  /**
   * Return a copy of the current vector scaled by the given amount.
   */
  scale(amount: number): this {
    return this.constructor.scale(this, amount);
  }

  equals(...vectors: this[]): boolean {
    return this.constructor.areEqual(this, ...vectors);
  }

  /**
   * Return the length of the vector.
   */
  getLength(): number {
    const squaredValues =
        this.getValues().map((value) => Math.pow(value, 2));
    return Math.sqrt(mathf.sum(...squaredValues));
  }

  /**
   * Return a copy of this vector scaled to the given length.
   */
  setLength(value: number): this {
    const currentLength = this.getLength();
    const scale = value / currentLength;
    return this.scale(scale);
  }

  /**
   * Return a copy of this vector scaled to the given length if its length
   * currently exceeds the given length. Otherwise return this vector.
   */
  clampLength(length: number): this {
    const currentLength = this.getLength();
    if (currentLength > length) {
      return this.setLength(length);
    } else {
      return this;
    }
  }

  /**
   * Return a copy of this vector with all its values multiplied by the
   * corresponding values in the given vector.
   */
  multiply(vector: this): this {
    return <this>new this.constructor(
        ...arrayf.zip<number>(this.getValues(), vector.getValues())
            .map(([a, b]) => a * b));
  }

  /**
   * Return a copy of this vector with all its values divided by the
   * corresponding values in the given vector.
   */
  divide(vector: this): this {
    return <this>new this.constructor(
        ...arrayf.zip<number>(this.getValues(), vector.getValues())
            .map(([a, b]) => a / b));
  }
}
