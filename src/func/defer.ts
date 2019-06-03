import { promises } from "fs";

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
 *   console.log(data.message);
 * })
 *
 * window.setTimeout(()=> {
 *   hello():
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
    public promise: Promise<any>;
    public reject: Function;
    constructor() {

        this.resolve = () => { };
        this.reject = () => { };
        this.promise = new Promise((resolve: Function, reject: Function) => {
            this.resolve = resolve;
            this.reject = reject;
        });

        Object.freeze(this);
    }

    getPromise(): Promise<any> {
        return this.promise;
    }

}
