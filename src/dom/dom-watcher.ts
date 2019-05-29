import { removeAllListeners } from "cluster";

export interface DomWatcherConfig {
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
    // The default event listerner options including passive, once etc.
    eventOptions?: Object | undefined;

    /**
     * The element to Watch
     */
    element: HTMLElement;

    /**
     * The name of the event to watch.
     */
    on: string;

    /**
     * The callback to execute.
     */
    callback: EventListenerOrEventListenerObject

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
 * watcher.add({
 *   element: window,
 *   on: 'scroll',
 *   callback: scrollCallback,
 *   eventOptions: { passive: true }
 * })
 *
 * watcher.add({
 *   element: element,
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
 * watcher.add({
 *   element: element,
 *   on: 'click',
 *   callback: ()=> {},
 *   id: 'abc'
 * );
 * watcher.removeById('abc');
 *
 *
 * // Ids actually don't need to be unique.
 * watcher.add({ element: element, on: 'click', callback: ()=> {}, id: 'group1');
 * watcher.add({ element: anotherElement, on: 'mousemove', callback: ()=> {}, id: 'group1');
 * watcher.removeById('group1');
 *
 * // Conditional execution
 * watcher.add({
 *    element: window
 *    callback: ()=> {
 *      console.log('called only on mobile');
 *    }
 *    eventOptions: { passive: true }
 *    on: 'scroll',
 *    runWhen: window.innerWidth < 600
 * });
 *
 *
 * watcher.add({
 *    element: submitElement
 *    callback: ()=> {
 *      console.log('submitted');
 *    }
 *    on: 'click',
 *    runWhen: ()=> { return this.validate()}
 * });
 *
 * ```
 *
 *
 *
 * @hidden
 */
export class DomWatch {
    /**
     * All internal watcher configs.
     */
    private watcherConfigs: Array<DomWatcherConfig>;

    constructor() {
        this.watcherConfigs = [];
    }

    add(config: DomWatcherConfig) {


        config.element.addEventListener(
            config.on,
            config.callback,
            config.eventOptions || {}
        )

        this.watcherConfigs.push(config);
    }

    removeById(id: string) {

    }

    removeAll() {

    }

}
