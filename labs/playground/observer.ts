/* eslint-disable @typescript-eslint/no-explicit-any */
export interface observerConfig {
  onNext?: Function;
  onError?: Function;
  onComplete?: Function;
}

/**
 * A basic observer class that responds to the push-base notifications from
 * observable. It won't do much on it's own.
 *
 * ```ts
 * new Observer({
 *   onNext: ()=> {},
 *   onError: ()=> {},
 *   onComplete: ()=> {}
 * })
 *
 * ```
 *
 * @hidden
 */
export class Observer {
  private next_: Function;
  private error_: Function;
  private complete_: Function;

  /**
   * @constructor
   */
  constructor(config: observerConfig = {}) {
    const emptyFunction = () => {};
    this.next_ = config.onNext || emptyFunction;
    this.error_ = config.onError || emptyFunction;
    this.complete_ = config.onComplete || emptyFunction;
  }

  /**
   * Handles the callback when the observable notified next.
   * @param {T} value - Observableから提供される値
   */
  onNext(value: any) {
    this.next_(value);
  }

  /**
   * Handles the callback when the observable notified error.
   * @param {any} err - Observableから提供される値
   */
  onError(err: any) {
    this.error_(err);
  }

  /**
   * Handles the callback when the observable notified complete.
   */
  onComplete() {
    this.complete_();
  }
}
/* eslint-enable */
