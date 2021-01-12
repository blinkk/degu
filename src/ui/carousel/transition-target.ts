export class TransitionTarget {
  private readonly element: HTMLElement;
  private readonly drivenBySync: boolean;

  constructor(element: HTMLElement, drivenBySync: boolean = false) {
    this.element = element;
    this.drivenBySync = drivenBySync;
  }

  getElement(): HTMLElement {
    return this.element;
  }

  isDrivenBySync(): boolean {
    return this.drivenBySync;
  }
}
