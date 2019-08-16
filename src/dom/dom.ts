import { mathf } from '../mathf/mathf';
import { Defer } from '../func/defer';
import { func } from '../func/func';

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
     * Top and bottom offset.
     * You can offset the top and bottom so that the calculations are shifted.
     *
     * ```ts
     *
     *     let startOffset = 100;
     *     // Now progress will start when the element is 100px inview.
     *     // But still will complete normally at the bottom.
     *     let progress =
     *             mathf.getElementScrolledPercent(this.element, startOffset, 0);
     *
     *     let startOffset = window.innerHeight;
     *     // Now progress when the top of the element hits the top of the screen.
     *     // But still will complete normally at the bottom.
     *     let progress =
     *             mathf.getElementScrolledPercent(this.element, startOffset, 0);
     *
     *     let heightOffset = -100;
     *     // Entry as normal - 0 when the element first comes into view.
     *     // Now progress will complete get to 0 when there is still 100px
     *     // of the element still to be shown since it is virtually 100px shorter.
     *     let progress =
     *             mathf.getElementScrolledPercent(this.element, 0, heightOffset);
     *
     *     // Now progress will complete when the element has scrolled past
     *     // the center of the screen since we virually extend the height by
     *     // 50vh.
     *     let heightOffset = window.innerHeight * 0.5;
     *     let progress =
     *             mathf.getElementScrolledPercent(this.element, 0, heightOffset);
     *
     *     // Now progress will complete when the element has scrolled past
     *     // the very top of the screen.
     *     let heightOffset = window.innerHeight * 1;
     *     let progress =
     *             mathf.getElementScrolledPercent(this.element, 0, heightOffset);
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
     * @param {number} startOffset A positive value (pixel) to offset the top position
     *     of the element.
     *     The start offset value should never be negative as technically, offseting
     *     to before the element comes into view doesn't have an effect and will
     *     only complicate things for you.
     *     Changing this value will affect the poitn at which your progress hits
     *     0 (starts).
     * @param {number} heightOffset A value (pixel) to add to the total height of
     *     the element.  Can be positive or negative values.  Think of this,
     *     shortening or growing your element virually.  Changing this value
     *     will affect the point at which your progress hits 1 (ends).
     * @return {number} percent The amount in percentage that the user has scrolled
     *     in the element.
     */
    static getElementScrolledPercent(element: HTMLElement,
        startOffset: number = 0,
        heightOffset: number = 0): number {
        const box = element.getBoundingClientRect();
        const wh = window.innerHeight;
        // We need to calculate this so that we start the 0% when the element comes
        // in (the top of the element).  But the 100% is marked when the BOTTOM
        // of the element passes the bottom of the screen.
        const current = wh - (box.top + startOffset);
        const percent = current / (box.height - startOffset + heightOffset);
        return mathf.clampAsPercent(percent);
    }


    /**
     * Sets a css variable to an element
     * @param element The element to set the css variable.
     * @param name The name of the css variable.
     * @param value The value to set.
     */
    static setCssVariable(element: HTMLElement, name: string, value: string) {
        if (!element) {
            throw new Error(
                'You need specificy a valid element to apply a css variable');
        }
        element.style.setProperty(name, value);
    }


    /**
     * Tests whether a given element is a descendant of another elemenet.
     *
     * Examples:
     * ```ts
     *  var isChild = dom.testDescendant(
     *      document.getElementById('button'),
     *      document.querySelector('.article'));
     *
     * // Whether the active focused element is under the article container.
     *  var isFocused = dom.testDescendant(document.activeElement,
     *      document.querySelector('.article'));
     * ```
     *
     * @param element The child element
     * @param parentElement The possible parent element
     * @return Whether element is a descendant of the provided parent element.
     */
    static testDescendant(element: HTMLElement,
        parentElement: HTMLElement): boolean {
        var currentNode = element.parentNode;
        while (currentNode) {
            if (currentNode == parentElement) {
                return true;
            }
            currentNode = currentNode.parentNode;
        }
        return false;
    }

    /**
     * Tests whether a given video element is playing.
     * @param videoElement
     */
    static testVideoIsPlaying(video: HTMLVideoElement): boolean {
        return !video.paused && !video.ended && video.readyState > 2;
    }

    /**
     * Pauses all videos inside of a given element.
     * @param element The element to search videos in for.
     * @param reset Whether to pause and reset the video to 0 seconds (start).
     */
    static pauseAllVideosInElement(element: HTMLElement, reset: boolean = false) {
        let videos = [...element.querySelectorAll('video')];
        videos.forEach((video) => {
            if (reset) {
                video.currentTime = 0;
            }
            video.pause();
        });
    }

    /**
     * Plays all videos inside of a given element.
     * @param element The element to search videos in for.
     * @param reset Whether to start playing from currentTime 0.
     */
    static playAllVideosInElement(element: HTMLElement, reset: boolean = false) {
        let videos = [...element.querySelectorAll('video')];
        videos.forEach((video) => {
            // try {
            if (reset) {
                video.currentTime = 0;
            }
            if (!dom.testVideoIsPlaying(video)) {
                let playPromise = video.play();
                playPromise.then(() => { }).catch((e) => { });
            }
            // } catch(e) {}
        });
    }

    /**
     * Allows you to make sure that all videos are loaded (readyState 4) in a
     * given element before executing callback.
     *
     * Note that this method executes polling in the background
     * to check for video state so use carefully.  Defaults to timeout after
     * 10000ms
     *
     * ```ts
     * // Wait for all videos to be loaded.
     * dom.whenVideosLoadedInElement(element).then(()=> {
     *   // Play all videos for example.
     *   dom.playAllVideosInElement(element);
     * })
     *
     * ```
     * @param element
     * @param timeout The amount of time in which to give up polling.
     * @return Promise
     */
    static whenVideosLoadedInElement(element: HTMLElement,
        timeout: number = 10000): Promise<any> {
        let videos = [...element.querySelectorAll('video')];
        let promises: Array<Promise<any>> = [];
        videos.forEach((video) => {
            let defer = new Defer();
            promises.push(defer.getPromise());
            func.waitUntil(() => video.readyState == 4, timeout, 10).then(() => {
                defer.resolve();
            });
        });

        return Promise.all(promises);
    }


    /**
     * Fires a event on the element.
     *
     * ```ts
     * dom.event(document, 'myCustomEvent', { message: hello});
     *
     * // Data gets passed on the event.detail.
     * document.addEventListener('myCustomEvent', (e)=> {
     *   console.log(e.detail.message); // Hello
     * }, false)
     * ```
     *
     * @param element
     * @param name
     * @param data
     */
    static event(element: HTMLElement, name: string, data: any) {
        var event = new CustomEvent(name, { detail: data });
        element.dispatchEvent(event)
    }


    /**
     * Creates an html element from a string.
     * ```
     * dom.createElementFromString("<div>Hohohoho</div>");
     * ```
     * @param htmlString
     */
    static createElementFromString(htmlString: string): HTMLElement {
        var div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild as HTMLElement;
    }
}