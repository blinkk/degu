


import { Raf } from '../raf/raf';
import { DomWatcher } from '../dom/dom-watcher';
import { mathf } from '../mathf/mathf';
import {dom} from '../dom/dom';


const InviewClassNames = {
    READY: 'ready',
    IN: 'in',
    IN_ONCE: 'in-once',
    DOWN: 'down',
    UP: 'up',
    OUT: 'out',
}


export interface InviewConfig {
    /**
     * The root element to track inview status.
     */
    element: HTMLElement,

    /**
     * Defines the baseline of the element.
     * The element baseline is the location in which we should use to
     * check the current element position.  Since we want to check
     * where in a viewport an element is, we need to know what point to use
     * in the element.  Should we use the top (0), middle (0.5) or bottom of the
     * element.
     */
    elementBaseline?: number,

    /**
     * Defines the viewport offset. This is a number between 0-1 where 0 is
     * the bottom of the screen and 1 is the top of the screen.  Defaults to 0.
     */
    viewportOffset?: number,

    /**
     * Optionally pass child selectors to add inview states to children.
     *
     * Example:
     * childSelector: [add-inview]
     *
     * Now any element with the attribute add-inview within the main element
     * will also receive inview class.
     *
     * Child selelectors also received 'inview-index' such as 'inview-index="0"
     * etc, allows you to use it to stagger inview.
     */
    childSelector?: string,

    /**
     * An additional options to pass to raf culling.  In most cases you can ignore
     * this but you can override the internal culling by passing a different
     * setting to fine tune optimization.
     *
     * Expects intersection observer options.  Defaults to:
     *
     * ```
     *    {
     *      rootMargin: '500px 0px 500px 0px'
     *    }
     * ```
     *
     */
    evIntersectionObserverOptions?: Object,

}

/**
 * Implements a basic type 1 inview.
 * Type 1 inview:
 * - will add an '.in' class to an element when the element is at
 *   at certain percentage of the viewport. (viewport offset) or
 *   when an X percentage of the element is visible or BOTH!.  See below.
 * - will add an '.in-once' when inview happens the first time.
 * - will immediately remove the '.in' class when the element goes out of
 *   view
 * - will immediately add '.out' class when the element goes out of
 *   view
 * - will add 'up' and 'down' class to the element based on the scroll direction
 *   allowing you to add directional inview.
 *
 *
 * # Inview Logic
 * The "logic" of how inview is calculated is important.  Two factors
 * are taken into consideration.
 *
 * The first is the elementBaseline.
 * The elementBaseline defaults to the very top of the element as that is the
 * most common case.  However, this is the line or point in the element in which the
 * trigger point is evaluated.  You can set it to a given percentage of
 * the element (like the very bottom of the element instead of the top).
 *
 * The second is the viewport offset.
 * The viewport offset ranges from 0-1 in which 0 is the bottom of the viewport window
 * and the 1 is the top.
 *
 *
 * Here are some examples of different settings.
 *
 * elementBaseline - 0 (top), viewportOffset - 0.2
 * => inview should happen when the top of the element crosses the bottom 20% of the window.
 *
 * elementBaseline - 0 (top), viewportOffset - 0.5
 * => inview should happen when the top of the element crosses the middle of the window.
 *
 * elementBaseline - 1 (bottom), viewportOffset - 0.5
 * => inview should happen when the bottom of the element crosses the middle of the window.
 *
 * elementBaseline - 0.2, viewportOffset - 0
 * => inview should happen when 20% of the element is visible.
 *
 * elementBaseline - 0.5, viewportOffset - 0
 * => inview should happen when 50% of the element is visible.
 *
 * elementBaseline - 0.5, viewportOffset - 0.5
 * => inview should happen when 50% of the element cross the middle of the screen.
 *
 * elementBaseline - 0, viewportOffset - 1
 * => inview should happen when then top of the element 0%, hits the top of the screen.
 *
 *
 *
 * # FOUC
 * While inview is booting up, there is a split second where it needs to evaluate the
 * inview state.  When inview is ready, the element will receive '.ready' class.
 *
 * You can do something like:
 *
 * ```
 * .myelement
 *    visibility: hidden
 * .myelement.ready
 *    visibility: visible
 *
 * ```
 */
export class Inview {
    private raf: Raf;
    private readWrite: Raf;
    private config: InviewConfig;
    private watcher: DomWatcher;

    /**
     * The last known scrollY
     */
    private scrollY: number;

    /**
     * Last known scroll direction. 1 down, -1 up, 0 no direction.
     */
    private scrollDirection: number;


    /**
     * A flag to keep track of whether the element was inview atleast once.
     */
    private inOnce: boolean;


    /**
     * A flag to keep track of in or out state.
     */
    private isInState: boolean = false;


    /**
     * The list of target elements to add inview to.
     */
    private targetElements: Array<HTMLElement>;

    constructor(config: InviewConfig) {
        this.config = Object.assign(
            {
                elementBaseline: 0,
                viewportOffset: 0,
            },
            config
        );
        this.raf = new Raf(this.onRaf.bind(this));
        this.readWrite = new Raf()
        this.scrollY = window.scrollY;
        // Force read even if the element is out of view.
        this.onRaf();


        this.scrollY = window.scrollY;
        this.watcher = new DomWatcher();
        this.watcher.add({
            element: window,
            on: 'scroll',
            callback: this.onWindowScroll.bind(this),
            eventOptions: { passive: true }
        })
        this.onWindowScroll();

        if (!this.config.element) {
            throw new Error("No element is defined for inview");
        }


        this.targetElements = [this.config.element];
        if (this.config.childSelector) {
            const childSelectors = Array.from(this.config.element.querySelectorAll(this.config.childSelector)) as Array<HTMLElement>;
            this.targetElements = [...this.targetElements, ...childSelectors];

            // Add invie inview
            this.readWrite.write(() => {
                this.targetElements.forEach((target: HTMLElement, i: number) => {
                    target.setAttribute('inview-index', i + '');
                })
            })
        }


        this.targetElements.forEach((target: HTMLElement, i: number) => {
            this.readWrite.write(()=> {
                console.log("suppy");
                target.classList.add(InviewClassNames.READY)
            })
        })

        this.raf.runWhenElementIsInview(this.config.element, this.config.evIntersectionObserverOptions || {
            rootMargin: '100px 0px 100px 0px'
        }).then(() => {
            this.raf.start();
        })
    }


    private onWindowScroll():void {
        this.raf.read(()=> {
            // Calculate the scroll direction.
            const scrollY = window.scrollY;
            this.scrollDirection = mathf.direction(this.scrollY, scrollY);
            this.scrollY = scrollY;
        })
    }



    /**
     * Request Animation Frame handle.  This runs only when the element is
     * in the viewport.
     *
     * TODO (uxder): Some of these values can be cached.
     */
    private onRaf(): void {

        // Figure out how much of this element is visible.
        this.raf.read(()=> {

            // Since generally, since we think in terms of scrolling down, 0 - 1 would
            // be represented as:
            // 1 ---> top of screen
            // 0.5 --> middle of screen
            // 0 --> bottom of screen
            //
            // Therefore, progress is represented as 0-1 where it goes from the bottom
            // of the screen to the top.
            //
            //
            // Additionally, we need to know, what point in the element should be
            // use to see where the element resides.  We could use the top,
            // center or bottom.
            //
            // The elementBaseline is used to factor this in.  The default state
            // is calculated from teh top of the element.
            let wh = window.innerHeight;
            let box = this.config.element.getBoundingClientRect();
            let elementBaseline =
                box.top + (this.config.elementBaseline * box.height);


            // This is the percent of where element baseline is.
            // So 0 would mean the elementbaseline is at the bottom of the viewport.
            // 1 would mean elementBaseline is at the top of the viewport.
            // A value less than viewport offset would mean that the element is above the viewport == outview.
            let inPercent = 1 - mathf.inverseLerp(0, wh,  elementBaseline, true);

            // This is the percent of where the BOTTOM of the element is in the viewport.
            // We want to use this to valuate whether the element is out of view.
            // A value greater than 1 would mean that the element is above the viewport == outview.
            let outPercent = 1 - mathf.inverseLerp(0, wh,  box.top + box.height, true);


            // The outview conditions are in the outpercent (bottom of the element) is greater than 1
            // or the inpercent (the element baseline) is below 0 under the screen.
            if(inPercent < this.config.viewportOffset || outPercent >= 1) {
                this.runOutviewState();
            } else {
                this.runInviewState();
            }


        })

    }


    public runInviewState() {
        if(this.isInState) {
            return;
        }
        this.readWrite.write(() => {
            this.targetElements.forEach((el) => {
                el.classList.remove(InviewClassNames.OUT);
                el.classList.add(InviewClassNames.IN);

                if (!this.inOnce) {
                    el.classList.add(InviewClassNames.IN_ONCE);
                    this.inOnce = true;
                }


                el.classList.remove(InviewClassNames.UP);
                el.classList.remove(InviewClassNames.DOWN);
                el.classList.add(this.scrollDirection == -1 ? InviewClassNames.UP : InviewClassNames.DOWN);
                this.isInState = true;
            })

        });
    }


    public runOutviewState() {
        if(!this.isInState) {
            return;
        }
        this.readWrite.write(() => {
            this.targetElements.forEach((el) => {
                el.classList.add(InviewClassNames.OUT);
                el.classList.remove(InviewClassNames.IN);
                el.classList.remove(InviewClassNames.UP);
                el.classList.remove(InviewClassNames.DOWN);
                el.classList.add(this.scrollDirection == -1 ? InviewClassNames.UP : InviewClassNames.DOWN);
                this.isInState = false;
            })
        });

    }

    public dispose(): void {
        this.raf && this.raf.dispose();
        this.readWrite && this.readWrite.dispose();
        this.watcher && this.watcher.dispose();
    }

}

