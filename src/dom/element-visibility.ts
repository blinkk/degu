

/**
 * A composition around the IntersectionObserver API.
 * Support is fairly good but if you want legacy browsers, look into polyfills.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 */
export class elementVisibility {


    /**
     * Uses the interaction API to detect element visibility.
     * @param {Element} el The element to observe
     * @param {Object?} options Interaction api options.
     *   This includes, root, threshold and rootMargin.
     *   @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
     * @param {Function} callback A callback function that is called on each change.
     *   The callback returns the element, changes, done.  Done is called to stop
     *   observiing.
     * @return {Object} The intersection observer.
     *
     * Basic usage:
     *
     * ```ts
     *
     *   elementVisibility.inview(element, { threshold: 0.3 },
     *     // Note that your callback will get immediately
     *     // called once to check visibility
     *     (element, changes, dispose)=> {
     *       if(changes.isIntersecting) {
     *         // The element is visibile.
     *
     *         dispose(); // Dispose if you want.
     *       }
     *     }
     *   );
     *
     * ```
     *
     * Disposing.  This is important to keep your app optimized.
     *
     * ```ts
     * let observer = elementVisibility.inview(el, null, ()=> {});
     * observer.dispose();
     * ```
     *
     *
     * Element visibility internally caches the last known changes so you
     * can use that in your app.
     *
     * This is often an easier way to do things that use the callback.
     *
     *
     * ```ts
     * let ev = elementVisibility.inview(element, {});
     *
     * console.log(ev.state().inview); // Is the elmeent inview now?
     *
     * window.setTimeout(()=> {
     *    console.log(ev.state().inview); // Is it inview now after 3 seconds.
     * }, 3000);
     *
     * window.addEventListener('scroll', () => {
     *    console.log(ev.state().inview); // Check to see it is in view.
     * });
     *
     * ev.state().changes; // A list of all known last changes.
     *                   Contains IntersectionObserverEntry list.
     * ev.state().lastChange; // Just the last known IntersectionObserverEntry.
     *
     *
     * ev.dispose(); // Remember to dispose.
     *
     * ```
     *
     *
     * I want to check if my element is inview just once.
     *
     * ```ts
     * let ev = elementVisibility.inview(element, {});
     * ev.inview; // True or False.
     * ev.dipose(); // Dispose it.
     * ```
     *
     * I want to run scroll events only when the element is inview.
     * See [[DomWatcher]] for an example of this.
     *
     *
     * ```
     */
    static inview(element: HTMLElement, options: Object, callback?: Function) {
        // Cache the last known state in the closure.
        let cachedChanges: any = [];
        let cachedLastChange: any = null;
        let cachedInview = false;

        /**
         * Get the last known state values of inview.
         */
        const state = () => {
            return {
                changes: cachedChanges,
                lastChange: cachedLastChange,
                inview: cachedInview
            }
        }

        const onChange =
            (entries: Array<IntersectionObserverEntry>) => {
                // Cache the values only if there was a change
                // so that it maintains the last known change.
                if (entries.length >= 1) {
                    cachedChanges = entries;
                    cachedLastChange = entries.slice(-1)[0];
                    cachedInview = cachedLastChange.isIntersecting;
                    console.log('update', cachedInview);
                }

                // Callback always passes the "current" entries even if there
                // are none.
                callback && callback(element, entries.slice(-1)[0], dispose)
            };

        let dispose = () => {
            observer.unobserve(element);
            observer.disconnect();
            cachedChanges = [];
            cachedLastChange = null;
        };
        let observer = new IntersectionObserver(onChange as any, options);
        observer.observe(element);
        return {
            observer: observer,
            dispose: dispose,
            state: state
        };
    }



}