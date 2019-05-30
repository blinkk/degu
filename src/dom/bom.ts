
import { is } from '../is/is';

/**
 * Yano BOM (browser object model) function
 */
export class bom {

    /**
     * Acts just like a regular window resize but fixes resize thrashing that
     * happens on mobile.
     *
     * The issue is that on mobile, there is that browser URL bar.  As the user
     * scrolls, the url bar scrolls way with it, increasing the viewport
     * height.  The window fires the resize event (since it is a different size).
     *
     * This causes a situation where, as the user scrolls through a page on
     * mobile, resize events are unnecessarily called if you only care
     * about the "width" changing.
     *
     * The method creates a listener on the window resize except it retains
     * memory of the last browser width.  If the browser width hasn't
     * changed, it will cull/cut off that event.
     *
     * ```ts
     * let done = bom.smartResize(()=> {
     *   console.log('window resize but called when user scrolls on mobile')
     * }, { passive: true});
     *
     *
     * // Call later to remove listener.
     * done();
     *
     * ```
     *
     *
     * This isn't applied on non-mobile browsers.
     * @param {Function} callback
     * @param {Object} options The resize options such as passive: true
     * @return {Function} A function that which when called, will automatically
     *     remove that attached listener from the window.
     */
    static smartResize(callback: Function, options: Object): Function {

        let width = 0;
        let handler: EventListener = () => {
            let currentWidth = window.innerWidth;
            let allowCallback = !is.mobile() || width !== currentWidth;
            if (allowCallback) {
                callback();
                width = currentWidth;
            }
        }
        window.addEventListener('resize', handler, options);

        return () => {
            window.removeEventListener('resize', handler);
        }
    }
}