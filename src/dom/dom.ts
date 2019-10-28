import { mathf } from '../mathf/mathf';
import { Defer } from '../func/defer';
import { func } from '../func/func';
import { is } from '../is/is';

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
     * @param {boolean} Optionally remove percent clamping.  This means it can return
     *     values outside 0-1.
     * @return {number} percent The amount in percentage that the user has scrolled
     *     in the element.
     *
     */
    static getElementScrolledPercent(element: HTMLElement,
        startOffset: number = 0,
        heightOffset: number = 0,
        noClamp: boolean = false): number {
        const box = element.getBoundingClientRect();
        const wh = window.innerHeight;
        // We need to calculate this so that we start the 0% when the element comes
        // in (the top of the element).  But the 100% is marked when the BOTTOM
        // of the element passes the bottom of the screen.
        const current = wh - (box.top + startOffset);
        const percent = current / (box.height - startOffset + heightOffset);
        return noClamp ? percent : mathf.clampAsPercent(percent);
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
     * Given a set of styles, add it to an element.
     *
     * ```ts
     * dom.addStyles(element, { left: "200px", '--mycssvariable': '20px'});
     * ```
     * @param element
     * @param style
     */
    static addStyles(element: HTMLElement, styles: Object) {
        for (var key in styles) {
            if (key.startsWith('--')) {
                dom.setCssVariable(element, key, styles[key]);
            }
        }
        Object.assign(element.style, styles);
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
     * Resets all videos inside of a given element.
     * @param element The element to search videos in for.
     */
    static resetAllVideosInElement(element: HTMLElement) {
        let videos = [...element.querySelectorAll('video')];
        videos.forEach((video) => {
            video.currentTime = 0;
        });
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
        return this.whenVideosLoaded(videos);
    }

    /**
     * Allows you to make sure that all videos are loaded (readyState 4)
     * before executing callback.
     *
     * Note that this method executes polling in the background
     * to check for video state so use carefully.  Defaults to timeout after
     * 10000ms
     *
     * ```ts
     * // Wait for all videos to be loaded.
     * const videos = [videoElement1, videoElement2];
     * dom.whenVideosLoaded(videos).then(()=> {
     *   //
     * })
     *
     * ```
     * @param element
     * @param timeout The amount of time in which to give up polling.
     * @return Promise
     */
    static whenVideosLoaded(videos: Array<HTMLVideoElement>,
        timeout: number = 10000): Promise<any> {
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


    /**
     * Removes an element from the dom.
     * @param element
     */
    static removeElement(element: HTMLElement) {
        element.parentNode!.removeChild(element);
    }


    /**
     * Executes a callback after window has loaded.
     * This isn't a simple window load event listening but
     * first makes a check if the window has already loaded.
     * If it has, the callback will immediately get executed,
     * otherwise, it will wait until the load event completes.
     * @param callback
     */
    static runAfterWindowLoad(callback: Function) {
        // Make sure we are at the bottom of the event
        // stack (hence setTimeout) - this avoids
        // edge cases in which windowLoaded is misevaluated.
        window.setTimeout(() => {
            if (is.windowLoaded()) {
                callback();
            } else {
                window.addEventListener('load', () => {
                    callback();
                }, { once: true });
            }
        })
    }


    /**
     * Executes a callback as soon as the user is not at the top of the screen.
     *
     * If the user is at the top of the screen when this is called, it will
     * wait until the user has scrolled down to execute.  If the user is already
     * not at the top of the screen, the callback will immediately execute.
     *
     * Note that if your document is less than 100vh, your callback will
     * never get executed because the user can't scroll and will always be at
     * the top of the screen.
     *
     * @param callback
     */
    static runAfterNotTopOfScreen(callback: Function) {
        if (window.scrollY !== 0) {
            callback();
        } else {
            window.addEventListener('scroll', () => {
                callback();
            }, { once: true, passive: true });
        }
    }

    /**
     * Gets the current browser aspect ratio.
     * 2 --> wide rectangle
     * 1 --> squre
     * 0.5 --> tall rectangle
     */
    static aspect() {
        return window.innerWidth / window.innerHeight;
    }


    /**
     * Gets the computed style of a given element .
     * @param element
     * @return CSSStyleDeclartion
     */
    static getComputedStyle(element: HTMLElement): CSSStyleDeclaration {
        return window.getComputedStyle(element);
    }


    /**
     * Creates an image in memory that is later deletable so it can
     * be released from native memory AND image cache.
     *
     * This method can be paired with deleteImage.
     *
     * // Consider the following:
     * new Image();
     * image.src = 'hohoho.jpg';
     * image.decode().then(()=> {
     *   // Do something.
     *   myCanvas.drawImage(image);
     *   image = null;
     * })
     *
     * This does appear to get GCed and removed from image cache but it is
     * never flushed from native memory.
     *
     * You can observe this by going to Chrome -> Task manager.  Make sure
     * you have the Memory and also the Image Cache columns.
     *
     * Theefore, usage of image.decode() for now, can lead to memory leaks that
     * can't be cured with image=null.
     *
     * The same is observed with ImageBitmaps.
     *
     * Related.
     * https://bugs.webkit.org/show_bug.cgi?id=31253
     *
     *
     * The solution is to use createObjectURL and later revoke that
     * so memory can be released.
     *
     * ```
     * const imageSource = '/public/image/cat.jpg';
     * const loader = new ImageLoader([imagesource]);
     *
     * // Cache the image in browser memory.
     *    dom.fetchAndMakeImage(imageSource).then(()=> {
     *
     *       // Do something with image.
     *       myCanvas.drawImage(image);
     *
     *       // Delete from memory.
     *       dom.deleteImage(image);
     *    })
     *
     * ```
     */
    static fetchAndMakeImage(source: string): Promise<HTMLImageElement> {
        return new Promise(resolve => {
            fetch(source)
                .then((response) => {
                    return response.blob();
                })
                .then((response) => {
                    const blob = response;
                    const img = document.createElement('img');
                    img.decoding = 'async';
                    img.onload = () => {
                        resolve(img);
                    }
                    img.src = URL.createObjectURL(blob);
                });
        });
    }


    /**
     * Makes images from a blob source.  Can be coupled with
     * delete image to quickly release memory.
     * @param blob
     */
    static makeImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
        return new Promise(resolve => {
            const img = document.createElement('img');
            img.decoding = 'async';
            img.onload = () => {
                img.onload = null;
                resolve(img);
            }
            img.src = URL.createObjectURL(blob);
        });
    }


    /**
     * Makes an image from a blob source.  This is an alternative to
     * URL.createObjectURL is to convert a Blob into a base64-encoded string.
     *
     *
     * Return somethig like:
     * <img src="data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAA">
     *
     * @param blob
     */
    static makeBase64ImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
        return new Promise(resolve => {
            let reader = new FileReader();
            reader.readAsDataURL(blob); // converts the blob to base64 and calls onload

            reader.addEventListener("load", () => {
                const img = document.createElement('img');
                img.src = reader.result as string;
                img.onload = () => {
                    img.onload = null;
                    resolve(img);
                }
            }, { once: true });
        });
    }


    static copyBase64Image(image: HTMLImageElement): Promise<HTMLImageElement> {
        return new Promise(resolve => {
            const img = document.createElement('img');
            img.src = image.src;
            img.onload = () => {
                img.onload = null;
                resolve(img);
            }
        });
    }


    /**
     * Deletes an image from memory.
     */
    static deleteImage(image: HTMLImageElement) {
        if (image) {
            // Delete ObjectURLs or base64
            if (image.src && (image.src.startsWith('blob:') || image.src.startsWith('data:'))) {
                URL.revokeObjectURL(image.src);
                image.src = '';
            }
            image = null;
        }
    }
}