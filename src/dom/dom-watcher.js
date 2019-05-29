import { removeAllListeners } from "cluster";

export interface DomWatchOptions extends EventListenerOptions {
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
    capture?: boolean;
    once?: boolean;
    passive?: boolean;

    /**
     * The name of the event to watch.
     */
    eventName: string;

    /**
     * The callback to execute.
     */
    callback: Function;

    /**
     * A condition in which the function should run.
     * For example, you may want to limit execution of the callback
     * to just mobile.
     */
    runWhen?: Function;

    /**
     * Pass an id to this lister
     */
    id?: Function;
}


/**
 * A class that helps with DOM events.  The main usecase for this class is
 * to be able to watch the dom and then later remove a group of events
 * all at once.
 *
 * Basic Usage
 * ```ts
 * let new watcher = new DomWatcher();
 *
 * var scrollCallback = (event, done)=> {
 *   // on scroll events.
 * };
 * watcher.add(window, {
 *   on: 'scroll',
 *   callback: scrollCallback,
 *   passive: true
 * })
 *
 * watcher.add(element, {
 *   on: 'click',
 *   callback: ()=> {},
 * );
 *
 *
 * // Removes all watchers.
 * watcher.removeAll();
 * ```
 *
 *
 * Advanged Usage
 * ```ts
 * let new watcher = new DomWatcher();
 *
 * // Removes by Id
 * watcher.add(element, {
 *   on: 'click',
 *   callback: ()=> {},
 *   id: 'abc'
 * );
 * watcher.removeById('abc');
 *
 *
 * // Conditional execution
 * watcher.add(window,{
 *    callback: ()=> {
 *      console.log('called only on mobile');
 *    }
 *    on: 'scroll',
 *    passive: true,
 *    runWhen: window.innerWidth < 600
 * });
 *
 *
 * watcher.add(submitElement,{
 *    callback: ()=> {
 *      console.log('submitted');
 *    }
 *    on: 'click',
 *    runWhen: ()=> { return this.validate()}
 * });
 *
 *
 * ```
 *
 * @hidden
 */
export class DomWatch() {

    add(element: HTMLElement, eventName: string, callback: Function,
        options: DomWatchOptions) {

    }

    removeById(id: string) {

    }

    removeAll() {

    }

}
