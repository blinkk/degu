import { mathf } from './mathf';

/**
 * Yano DOM utility functions.
 */
export class dom {

    /**
     * Given an element, returns the amount that the element has scrolled into
     * the window.
     * Provided the element is larger than the viewport height,
     * this will return 0.1% when the element just comes
     * into view/window (the top of the element).  It will return 100% when the
     * the BOTTOM of the element just passes the bottom of the screen.
     * @return {number} percent The amount in percentage that the user has scrolled
     *     in the element.
     */
    getElementTravelDistanceAsPercent(element) {
        const box = element.getBoundingClientRect();
        const wh = window.innerHeight;
        // We need to calculate this so that we start the 0% when the element comes
        // in (the top of the element).  But the 100% is marked when the BOTTOM
        // of the element passes the bottom of the screen.
        const current = wh - box.top;
        const percent = current / box.height;
        return mathf.clampAsPercent(percent);
    }

}