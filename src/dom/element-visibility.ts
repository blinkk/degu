

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
     * Example:
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
     * Example: Manually unobserve.
     * let observer = elementVisibility.inview(el, null, ()=> {});
     * observer.dispose();
     *
     * ```
     */
    static inview(element: HTMLElement, options: Object, callback: Function) {
        const onChange =
            (el: HTMLElement, changes: Array<any>, dispose: Function) =>
                callback(element, changes.slice(-1)[0], dispose);
        return elementVisibility.elementInViewWatcher_(element, options, onChange);
    }


    static elementInViewWatcher_(el: HTMLElement, options: Object, callback: Function) {
        let dispose = () => {
            observer.unobserve(el);
            observer.disconnect();
        };
        let onChange = (changes: any) => callback(el, changes, dispose);
        let observer = new IntersectionObserver(onChange, options);
        observer.observe(el);
        return {
            observer: observer,
            dispose: dispose
        };
    }

}