export class TransitionTarget {
  private readonly target: HTMLElement;
  private readonly timeRange: [number, number];
  private readonly translationRange: [number, number];

  constructor(
    target: HTMLElement,
    timeRange: [number, number],
    translationRange: [number, number]
  ) {
    this.translationRange = translationRange;
    this.target = target;
    this.timeRange = timeRange;
  }

  getTarget(): HTMLElement {
    return this.target;
  }

  getTranslationRange(): [number, number] {
    return this.translationRange;
  }

  getTimeRange(): [number, number] {
    return this.timeRange;
  }
}
