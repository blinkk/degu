
import { DomWatcher } from './dom-watcher';
import { dom } from './dom';


export interface ScrollToOnFocusConfig {
    /**
     * The root parent element.
     */
    element: HTMLElement;

    /**
     * The top offset of the progress.
     */
    topProgressOffset: number,

    /**
     * The bottom offset of the progress.
     */
    bottomProgressOffset: number,


    /**
     * Whether to scroll to the element when its click on.
     * Handy for debuggin.
     */
    mouseDown?: boolean

    /**
     * For any element with data-scroll-to-on-focus automatically set
     * the tabindex=0.  For VO focus to be acquired, tabindex=0 is required
     * so generally you can set this to true.
     */
    setTabIndex?: boolean
}



/**
 * A class that jumps to a specific scroll point when a given
 * element is focused on.
 *
 *
 * This class is designed to help with a11y issues common with
 * css-parallax, lottie-directive or any other module where
 * scroll based progress is calculated.
 *
 *
 * Consider the following example:
 * ```
 * <div sticky-300vh>
 *   <div sticky-child>
 *     <div chapter-1>
 *     <div chapter-2>
 *     <div chapter-3>
 *     <div chapter-4>
 *   </div>
 * </div>
 * ```
 *
 * Our module is 300vh tall and we have a sticky child.
 * We then setup css-parallax and for every 0.25 (25%) progress,
 * we hide the visibility / opacity of each chapter.
 * In other words, as you scroll, the chapters fade in and out.
 *
 * The problem with this is that when using VO or another screenreader,
 * the scroll position never updates as you focus on each chapter and
 * creates a situation where you are selecting an element that might
 * still have an opacity 0.
 *
 * To solve this, you can use this class.
 *
 * ```
 * <div sticky-300vh>
 *   <div sticky-child>
 *     <div chapter-1 data-scroll-to-on-focus="0" role="region">
 *     <div chapter-2 data-scroll-to-on-focus="0.25" role="region">
 *     <div chapter-3 data-scroll-to-on-focus="0.5" role="region">
 *     <div chapter-4 data-scroll-to-on-focus="0.75" role="region">
 *   </div>
 * </div>
 *
 * new ScrollToOnFocus({
 *    element: document.querySelector('[sticky-child]'),
 *    setTabIndex: true
 *    // These values should match however you are calculating
 *    // progress.
 *    topProgressOffset: 0,
 *    bottomProgressOffset: 0,
 * })
 *
 * // The focus element require a tabindex so remove it if needed.
 * [data-scroll-to-on-focus]:focus-visible
 *   outline: 2px solid #1967D2
 * [data-scroll-to-on-focus]:focus:not(:focus-visible)
 *   outline: none
 * ```
 *
 * Now when using VO, if you focus on chapter-2, it will jump to
 * the progress 0.25 position.
 *
 *
 *
 * ### Note on role="region" and tabindex
 *
 * By default, this class will add a tabindex="0" to the data-scroll-to-on-focus
 * element.  Without a tabindex, we cannot acquire a focus event on the element.
 * When dong this, VO and other screenreaders will read and announce the content
 * of the element which can result in a unwanted double announcement (if you have
 * say a title and body within the element).
 *
 * To avoid the issue, it is recommended to add role="region" to your element.
 *
 *
 *
 */
export class ScrollToOnFocus {
    private element: HTMLElement;
    private watcher: DomWatcher;
    private selector: string;
    private topProgressOffset: number;
    private bottomProgressOffset: number;


    constructor(private config: ScrollToOnFocusConfig) {

        this.element = config.element;
        this.watcher = new DomWatcher();
        this.selector = 'data-scroll-to-on-focus';
        this.topProgressOffset = config.topProgressOffset || 0;
        this.bottomProgressOffset = config.bottomProgressOffset || 0;


        const elements: Array<HTMLElement> =
            Array.from(this.element.querySelectorAll(`[${this.selector}]`));

        elements.forEach((el) => {

            if(config.setTabIndex) {
                el.tabIndex = 0;
            }


            this.watcher.add({
                element: el,
                on: 'focus',
                callback: () => {
                    this.handleFocus(el);
                },
                eventOptions: { capture: true }
            });

            if (config.mouseDown) {
                this.watcher.add({
                    element: el,
                    on: 'mousedown',
                    callback: () => {
                        this.handleFocus(el);
                    }
                });
            }
        })
    }


    /**
     * Handle focus on an element.
     */
    private handleFocus(focusedElement: HTMLElement) {
        const targetPercent = focusedElement.getAttribute(this.selector);
        if (targetPercent) {
            this.scrollTo(+targetPercent);
        }
    }



    /**
     * Scroll to a specific window position
     * @param targetPercent
     */
    private scrollTo(targetPercent: number) {
        // Given the top and bottom progress offset, get the windowY value of
        // the provided percent.
        const scrollY = dom.getScrollYAtPercent(
            this.element,
            this.topProgressOffset, this.bottomProgressOffset,
            targetPercent
        );

        // Scroll To that point.
        window.scrollTo(0, scrollY);
    }

    public dispose() {
        this.watcher && this.watcher.dispose();
    }

}