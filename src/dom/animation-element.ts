export interface AnimationElementState {
  name: string;
  cssClass: string;
}

export interface AnimationElementConfig {
  element: HTMLElement;
  states: Array<AnimationElementState>;
}

/**
 * Creates a basic animation element that appends and removes classes.
 *
 *
 *
 * ````
 * const animationEl = new AnimationElement({
 *    element: document.getElementById("my-element"),
 *    states: [
 *      { name: 'intro', cssClass: 'my-element---intro'},
 *      { name: 'outro', cssClass: 'my-element---outro'},
 *    ]
 * })
 *
 *
 * animationEl.play('intro').then(()=> {
 *     // Do something.
 *    animationEl.play('outro');
 * })
 *
 *
 * ```
 *
 */
export class AnimationElement {
  private el: HTMLElement;
  private states: Array<AnimationElementState>;

  constructor(config: AnimationElementConfig) {
    this.el = config.element;
    this.states = config.states;
  }

  /**
   * Removes all states from the element.
   */
  public reset(): void {
    this.states.forEach((state: AnimationElementState) => {
      this.el.classList.remove(state.cssClass);
    });
  }

  /**
   * Plays a given state.
   *
   * ```
   * animationElement.play('intro').then(()=> {
   *   // Do something when animation ends.
   * })
   *
   *
   * // Automatically remove 'intro' when animation is complete.
   * animationElement.play('intro', true);
   *
   * ```
   */
  public play(name: string, resetOnComplete = false): Promise<void> {
    return new Promise(resolve => {
      const state = this.getState(name);
      this.reset();
      this.el.classList.add(state.cssClass);
      this.el.addEventListener(
        'animationend',
        () => {
          if (resetOnComplete) {
            this.reset();
          }
          resolve();
        },
        {once: true}
      );
    });
  }

  /**
   * Stack is similar to play but it doesn't remove previous cssClasses before
   * appending the current state.  This allows you to "stack" states.
   *
   * ```
   * animationElement.play('intro').then(()=> {
   *   // Do something when animation ends.
   *   // Stacks the outro.  Now the element would have .intro and .outro together
   *   animationElement.stack('outro');
   * })
   *
   * ```
   * @param name
   * @param resetOnComplete
   */
  public stack(name: string, resetOnComplete = false): Promise<void> {
    return new Promise(resolve => {
      const state = this.getState(name);
      this.el.classList.add(state.cssClass);
      this.el.addEventListener(
        'animationend',
        () => {
          if (resetOnComplete) {
            this.reset();
          }
          resolve();
        },
        {once: true}
      );
    });
  }

  /**
   * Filters through the state list to find a given state by name.
   */
  private getState(name: string) {
    return this.states.filter(state => {
      return state.name === name;
    })[0];
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
