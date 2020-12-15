class NumericRange {

  static fromUnorderedValues(a: number, b: number): NumericRange {
    return new NumericRange(Math.min(a, b), Math.max(a, b));
  }

  static clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
  }

  static fromRangeInput(rangeInput: HTMLInputElement): NumericRange {
    return new NumericRange(
        parseFloat(rangeInput.min), parseFloat(rangeInput.max));
  }

  private readonly min: number;
  private readonly max: number;

  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }

  clamp(value: number): number {
    return Math.min(this.max, Math.max(this.min, value));
  }

  contains(value: number): boolean {
    return this.min <= value && value <= this.max;
  }

  adjust(value: number): NumericRange {
    return new NumericRange(this.min + value, this.max + value);
  }

  add(value: number): NumericRange {
    return this.adjust(value);
  }

  subtract(value: number): NumericRange {
    return this.adjust(-value);
  }

  expand(value: number): NumericRange {
    return new NumericRange(this.min - value, this.max + value);
  }

  collapse(value: number): NumericRange {
    return this.expand(-value);
  }

  getMin(): number {
    return this.min;
  }

  getMax(): number {
    return this.max;
  }

  getDistance(): number {
    return this.max - this.min;
  }

  getValueAsPercent(value: number, clamp: boolean = true): number {
    const raw = (value - this.min) / (this.max - this.min);
    return clamp ? new NumericRange(0, 1).clamp(raw) : raw;
  }

  getPercentAsValue(percent: number, clamp: boolean = true): number {
    const finalPercent =
        clamp ? new NumericRange(0, 1).clamp(percent) : percent;
    return this.min + (this.max - this.min) * finalPercent;
  }

  getPercentAsInt(percent: number): number {
    return Math.round(this.getPercentAsValue(percent));
  }

  getOverlap(overlap: NumericRange): NumericRange {
    if (!this.hasOverlap(overlap)) {
      return null;
    }
    return new NumericRange(
        Math.max(
            this.min, overlap.getMin()), Math.min(this.max, overlap.getMax()));
  }

  hasOverlap(overlap: NumericRange): boolean {
    return this.max >= overlap.getMin() && overlap.getMax() >= this.min;
  }

  shiftToZeroMin(): NumericRange {
    return new NumericRange(0, this.getMax() - this.getMin());
  }
}

export { NumericRange };
