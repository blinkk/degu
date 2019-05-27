import { mathf } from '../mathf/mathf';

/**
 * Yano DOM utility functions.
 */
export class dom {

    /**
     * Given an element, returns the amount that the element has been scrolled
     * through in the the window.
     *
     * Example:
     * This method is particularly useful when you have a 100vh sticky element
     * and want a relative distance travelled percentage.
     *
     * ```
     * HTML
     * <div class="parent">
     *    <div class="child"><div class="content"></div>
     * </div>
     *
     * SASS
     * .parent
     *   position: relative
     *   height: 300vh  // Should be more than 100vh
     * .child
     *   position: sticky
     *   height: 100vh
     *   width: 100%
     *   top: 0
     * .contents
     *   position: relative
     *   height: 100vh
     *
     * JS
     *
     *  window.addEventListener('scroll', () => {
     *     let progress =
     *             mathf.getElementScrolledPercent(this.stickyParent_);
     *     // 0 when the above the element,
     *     // increases as you scroll thorugh
     *     // 1 when the bottom of the element reaches the bottom of the screen.
     *     console.log(progress);
     *   });
     *
     *
     * ```
     *
     * Provided the element is larger than the viewport height,
     * this will return 0% when the element is above the screen,
     * it increases in value as the user scrolls through the element and
     * finally when the BOTTOM of the element just passes the bottom of the screen
     * it returns 1.
     *
     * This method assumes that the tracked element is atleast more than 100vh.
     *
     * @param {HTMLElement} element The root element.
     * @return {number} percent The amount in percentage that the user has scrolled
     *     in the element.
     */
    static getElementScrolledPercent(element: HTMLElement): number {
        const box = element.getBoundingClientRect();
        const wh = window.innerHeight;
        // We need to calculate this so that we start the 0% when the element comes
        // in (the top of the element).  But the 100% is marked when the BOTTOM
        // of the element passes the bottom of the screen.
        const current = wh - box.top;
        const percent = current / box.height;
        return mathf.clampAsPercent(percent);
    }


    /**
     * Sets a css variable to an element
     * @param element The element to set the css variable.
     * @param name The name of the css variable.
     * @param value The value to set.
     */
    static setCssVariable(element: HTMLElement, name: string, value: string) {
        element.style.setProperty(name, value);
    }

}