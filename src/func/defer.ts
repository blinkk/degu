//https://gist.github.com/uxder/b9bd3811e0508fae42c1df64155b9c8b

/**
 * A basic deferred promise.  Allows you to resolve/reject a promise at a later
 * time.
 *
 *
 * ```ts
 *
 * let defer = new Defer();
 *
 * // Resolve the defer at a later time.
 * let hello = ()=> {
 *   defer.resolve({ message : 'you said hello'});
 *
 *   // If you need to reject.
 *   // defer.reject();
 * }
 *
 *
 * // Get the promise and handle it.
 * defer.getPromise().then((data)=> {
 *   console.log(data.message); // you said hello
 * })
 *
 * window.setTimeout(()=> {
 *   hello();
 * }, 200)
 *
 *
 *
 * ```
 *
 * @tested
 */
export class Defer {
  public resolve: Function;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public promise: Promise<any>;
  public reject: Function;
  public complete: boolean;

  constructor() {
    this.resolve = () => {};
    this.reject = () => {};
    this.complete = false;

    this.promise = new Promise((resolve: Function, reject: Function) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.resolve = (data: any) => {
        this.complete = true;
        return resolve(data);
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.reject = (data: any) => {
        this.complete = true;
        return reject(data);
      };
    });
  }

  /**
   * Returns the deferred promise.  If the defer was already completed for
   * some reason, will return a promise that is immediately resolved.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPromise(): Promise<any> {
    if (this.complete) {
      return new Promise((resolve: Function) => {
        resolve();
      });
    } else {
      return this.promise;
    }
  }
}
