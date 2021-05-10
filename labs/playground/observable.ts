import {Observer} from './observer';

/**
 * A basic implementation of an observable class.  Use with Observer.
 *
 * Only the following are available so far.
 * subscribe
 * of, fromEvents
 * map
 *
 *
 * ```ts
 *
 *       let obs =
 *           Observable.fromEvent(document, 'click')
 *             .map(event => event.clientX)
 *
 *       const observer = new Observer({
 *           onNext: (x) => { console.log('clientX', x); },
 *           onError: (x) => { console.log('error'); },
 *           onComplete: (x) => { console.log('complete'); },
 *      });
 *
 *      obs.subscribe(observer);
 *
 * ```
 * @hidden
 */
export class Observable {
  /**
   * The main process / function to run when subscription begins.
   */
  private handler: Function | null;

  /**
   * Creates a basic Obvservable claass.
   * @constructor
   * @param {Function} handler Is the main function to run when subscription
   *     begins.
   */
  constructor(handler: Function) {
    this.handler = null;
    if (handler) {
      this.handler = handler;
    }
  }

  /**
   * Subscribe to this observer.  Passes the Observer down to the handler that * is currently registered to this observable.  The handler will receive
   * the Observer and call onNext and update values as needed.
   * @param observer
   */
  subscribe(observer: Observer): Observable {
    return this.handler && this.handler(observer);
  }

  /**
   * An operator that creates a new observable wrapping a map function around the next value.
   *
   * ```ts
   *
   *
   *  const observer = new Observer({
   *     onNext: (x) => { console.log('values', x); },
   *  });
   *
   * Observable.of(1, 2, 3).map((value) => {
   *    return value * 2;
   * }).subscribe(observer);
   *
   *
   * // Outputs...2, 4, 6
   * ```
   * @param mapFunction
   */
  map(mapFunction: Function): Observable {
    const mapHandler = (observer: Observer) => {
      return this.subscribe(
        new Observer({
          onNext: (val: any) => observer.onNext(mapFunction(val)),
          onError: (e: any) => observer.onError(e),
          onComplete: () => observer.onComplete(),
        })
      );
    };

    return new Observable(mapHandler);
  }

  /**
   * Creates a basic observable from the passed arguments.
   *
   * ```ts
   *
   *  const observer = new Observer({
   *     onNext: (x) => { console.log('values', x); },
   *  });
   *
   * Observable.of(1, 2, 3).subscribe(observer);
   *
   * // Outputs..1, 2, 3.
   * ```
   * @param args
   */
  static of(...args: any): any {
    const ofHandler = (observer: Observer) => {
      args.forEach((val: any) => {
        observer.onNext(val);
      });
      observer.onComplete();
    };

    // Return a new observable with the of handler.
    return new Observable(ofHandler);
  }

  /**
   * Creates a basic observable from event.
   *
   * ```ts
   *
   *   let obs = Observable.fromEvent(document, 'click')
   *             .map((event)=> {
   *                return event.clientX;
   *             })
   *
   *   let myDocumentClickSubscription = obs.subscribe(
   *       new Observer({
   *           onNext: (x) => { console.log('clientX', x); },
   *           onError: (x) => { console.log('error'); },
   *           onComplete: (x) => { console.log('complete'); },
   *       })
   *   );
   *
   *
   *  window.setTimeout(()=> {
   *   // Call to remove and cancel subscription.
   *   myDocumentClickSubscription();
   * }, 2000)
   *
   * ```
   * @param args
   */
  static fromEvent(
    source: Object | HTMLElement,
    eventName: string
  ): Observable {
    const fromEventHandler = (observer: Observer): Object => {
      const callbackFn = (e: any) => {
        observer.onNext(e);
      };
      // Every time the event happens, run the callback and notify
      // observer of the next value.
      source['addEventListener'](eventName, callbackFn);
      return () => {
        source['removeEventListener'](eventName, callbackFn);
      };
    };

    const obs = new Observable(fromEventHandler);
    return obs;
  }
}
