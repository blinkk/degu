

import { elementVisibility, ElementVisibilityObject } from './element-visibility';
import { DomWatcher } from './dom-watcher';
import { mathf } from '../mathf/mathf';
import { dom } from './dom';
import { Raf } from '../raf/raf';


export interface HorizontalScrollElementMouseState {
    x: number;
    down: boolean;
    start: number;
    lastX: number;
}

export interface HorizontalScrollElementPositions {
    el: HTMLElement;
    x: number;
    centerX: number;
    width: number;
}

/**
 *
 * This is useful in creating a draggable horizontal scroll area that is draggable.
 * This like a horizontal carousel basically.
 * The items will get centered in position.
 *
 * ```
 * <div class="scroll" id="myscroller">
 *   <div class="scroll-item" scroll-item>
 *      <div class="scroll-item__inner" scroll-inner>...</div>
 *   </div>
 *   <div class="scroll-item" scroll-item>
 *      <div class="scroll-item__inner" scroll-inner>...</div>
 *   </div>
 *   <div class="scroll-item" scroll-item>
 *      <div class="scroll-item__inner" scroll-inner>...</div>
 *   </div>
 * </div>
 *
 *
 * const hr = new HorizontalScrollElement(document.getElementById('myscroller'));
 * ```
 *
 * Sample css to go with it.
 *
 * - while dragging, the root element will receive a "dragging" css class.
 * - the active child element will receive a "slide-active" class.
 * - use scroll-item__inner (the inner element) to size your items.
 *
 * ```
 * =scroll-snap
 *   width: 100%
 *   display: flex
 *   overflow-x: scroll
 *   overflow-y: hidden
 *   -webkit-overflow-scrolling: touch
 *   transition: 0.2s all ease
 *   transform: scale(1.0)
 *   user-drag: none
 *   a
 *     user-select: none
 *     user-drag: none
 *   img
 *     pointer-events: none
 *   &::-webkit-scrollbar
 *       background: transparent
 *       width: 0
 *   &.dragging
 *       transform: scale(1.01)
 *   [scroll-item]
 *       position: relative
 *       &:hover
 *       cursor: grab
 *   [scroll-inner]
 *       position: relative
 *       user-select: none
 *       width: 85vw
 *       +sd-lt
 *         margin-right: 24px
 *   [scroll-item]:first-child
 *       +sd-lt
 *         margin-left: 24px
 *
 *
 * .myscroller
 *   +scroll-snap
 * .myscroll img
 *   point-events: none
 * ```
 *
 *
 * # Turn off snapping.
 * This will turn it into a free flowing.
 *
 * ```
 * hr.enableSnapToClosest(false);
 * ```
 *
 *
 * # Use css variable mode.  This will set a css variable with the offset value.
 *   This allows you to set the scroll position with transformX instead of scrollLeft
 *   for perf boosts.
 * ```
 * hr.enableCssVar(true);
 *
 *
 * .myroot
 *   transform: translateX(var(--horizontal-scroll-x))
 *   will-change: transform
 * ```
 *
 *
 * ## The dragging is buggy
 * This is sometimes causes by the fact that you can focus into a `<img>` element.
 * Make sure you have:
 *
 * ```
 * .mymodule img
 *   point-events: none
 *
 * or sometimes these can help:
 *   user-select: none
 *   user-drag: none
 * ```
 *
 *
 * # Adding slide effects
 * ```
 * hr.enableSlideDeltaValues(true);
 *
 * // Now the chapter will sorta parallax as it slides in and shifts.
 * .myslide .mychapter
 *   transform: translateX( calc(var(--horizontal-scroll-in-x) * 50px))
 *   will-change: transform
 *
 *
 * var(--horizontal-scroll-in-x) --> -1 - 0 - 1
 * var(--horizontal-scroll-in-x-ab) --> 1 - 0 - 1
 * var(--horizontal-scroll-in-x-abs-inv) --> -1 - 0 - -1
 * ```
 *
 * Now further, sometimes, you may want to apply these effects to elements outside the slide.
 * For example, you might having something like this:
 *
 * ```
 * <div class="scroll" id="myscroller">
 *   <div class="scroll-item" scroll-item>
 *      <div class="scroll-item__inner" scroll-inner>...</div>
 *   </div>
 *   ...
 * </div>
 *
 * <div class="chapters">
 *   <div class="chapters">... </div>
 *   ...
 * </div>
 * ```
 * In this case, we have slides but also have the same number of chapters outside the slide.  This allow you to
 * "fix" the chapter in place and create different effects.  If you want to add the same horizontal-scroll-in
 * values to the chapters, you can do this:
 *
 *
 * ```
 * // Get your chapters or elements you want to apply the slide effects.
 * // This should be the same count as your slides.
 * var chapters = Array.from(document.querySelectorAll('.chapters')) as Array<HTMLElement>;
 *
 * // Now add them.
 * hr.addSlideDeltaValuesToElements([chapters]);
 *
 *
 * // You can add multiple.
 * hr.addSlideDeltaValuesToElements([chapters, anotherSet]);
 *
 * ```
 *
 *
 */
export class HorizontalScrollElement {
    private root: HTMLElement;
    private domWatcher: DomWatcher;
    private mouseState: HorizontalScrollElementMouseState;
    private currentX: number = 0;
    private targetX: number = 0;
    private rafEv: ElementVisibilityObject;
    private raf: Raf;
    private useSnapToClosest: boolean = true;
    private items: Array<HTMLElement>;
    private childrenPositions: Array<HorizontalScrollElementPositions>;
    private index: number = 0;
    private useCssVar: boolean = false;
    private useSlideDeltaValues: boolean = false;
    private scrollWidth: number;
    private slideDeltaValuesElements: Array<Array<HTMLElement>> = [];
    private windowWidth: number;

    constructor(rootElement: HTMLElement) {
        this.root = rootElement;
        this.raf = new Raf(this.onRaf.bind(this));
        this.items = Array.from(this.root.children) as Array<HTMLElement>;

        this.domWatcher = new DomWatcher();
        this.domWatcher.add({
            element: window,
            on: 'smartResize',
            callback: () => { window.setTimeout(this.onWindowResize.bind(this), 0) },
            eventOptions: {
                passive: true
            }
        });


        this.calculateChildPositions();
        this.slideTo(0);
        this.draw(true);



        this.mouseState = {
            x: 0,
            down: false,
            start: 0,
            lastX: 0
        }
        this.rafEv = elementVisibility.inview(this.root, {},
            (element: any, changes: any) => {
                if (changes.isIntersecting) {
                    this.raf.start();
                } else {
                    this.raf.stop();
                }
            });


        this.setupMouseDrag();
    }

    private onRaf(): void {
        this.raf.write(() => {
            this.draw();
        })
    }


    public draw(force: boolean = false) {
        const currentX = mathf.roundToPrecision(this.currentX, 3);
        if (currentX == this.targetX && !force) {
            return;
        }
        let dampedTarget = mathf.damp(
            currentX, this.targetX, 0.4, 0.2);
        this.setScrollPosition(dampedTarget);


        if (this.useSlideDeltaValues) {
            this.childrenPositions.forEach((child, i) => {
                const current = this.currentX;
                const delta = child.centerX - current;
                const percent = delta / this.scrollWidth;
                const halfPercent = mathf.inverseLerp(0, 0.5, percent, true);
                const quartPercent = mathf.inverseLerp(0, 0.25, percent, true);

                dom.setCssVariables(child.el, {
                    '--horizontal-scroll-in-x': percent,
                    '--horizontal-scroll-in-x-half': halfPercent,
                    '--horizontal-scroll-in-x-quart': quartPercent,
                    '--horizontal-scroll-in-x-abs': Math.abs(percent),
                    '--horizontal-scroll-in-x-abs-half': Math.abs(halfPercent),
                    '--horizontal-scroll-in-x-abs-quart': Math.abs(quartPercent),
                    '--horizontal-scroll-in-x-abs-inv': 1 - Math.abs(percent),
                    '--horizontal-scroll-in-x-abs-inv-half': 1 - Math.abs(halfPercent),
                    '--horizontal-scroll-in-x-abs-inv-quart': 1 - Math.abs(quartPercent),
                })

                // Add the same css value to associated slieDeltaValueElements
                this.slideDeltaValuesElements.forEach((group: Array<HTMLElement>) => {
                    dom.setCssVariables(group[i], {
                        '--horizontal-scroll-in-x': percent,
                        '--horizontal-scroll-in-x-half': halfPercent,
                        '--horizontal-scroll-in-x-quart': quartPercent,
                        '--horizontal-scroll-in-x-abs': Math.abs(percent),
                        '--horizontal-scroll-in-x-abs-half': Math.abs(halfPercent),
                        '--horizontal-scroll-in-x-abs-quart': Math.abs(quartPercent),
                        '--horizontal-scroll-in-x-abs-inv': 1 - Math.abs(percent),
                        '--horizontal-scroll-in-x-abs-inv-half': 1 - Math.abs(halfPercent),
                        '--horizontal-scroll-in-x-abs-inv-quart': 1 - Math.abs(quartPercent),
                    })
                })
            });
        }
    }


    private setupMouseDrag() {
        const downHandler = (e: any) => {
            let eventX = e.touches && e.touches[0].clientX || e.x;
            this.mouseState = {
                x: eventX,
                down: true,
                lastX: eventX,
                start: eventX,
            };
            this.targetX = this.currentX;

            this.raf.write(() => {
                this.root.classList.add('dragging');
            })
        };
        this.domWatcher.add({
            element: this.root,
            on: 'touchstart',
            callback: downHandler.bind(this),
            eventOptions: {
                passive: true
            }
        });
        this.domWatcher.add({
            element: this.root, on: 'mousedown',
            callback: downHandler.bind(this),
            eventOptions: {
                passive: true
            }
        });
        this.domWatcher.add({
            element: this.root, on: 'dragstart',
            callback: downHandler.bind(this),
            eventOptions: {
                passive: true
            }
        });

        // Prevent drags.
        this.domWatcher.add({
            element: this.root, on: 'dragover',
            callback: (e: any) => {
                e.preventDefault();
            },
        });

        const moveHandler = (e: any) => {
            let eventX = e.touches && e.touches[0].clientX || e.x;
            if (this.mouseState.down) {
                this.mouseState.x = eventX;
                let diff = this.mouseState.lastX - this.mouseState.x;
                // Drag sensititiy.  The higher the less effort requires to move around.
                // Make it less sensitive towards mobile.
                let normalizedWindowSize = mathf.inverseLerp(300, 3000, this.windowWidth);
                let dragSensitivity = mathf.lerp(1.4, 3, normalizedWindowSize);
                this.targetX += diff * dragSensitivity;
                this.mouseState.lastX = this.mouseState.x;
            }
        };

        this.domWatcher.add({
            element: this.root, on: 'touchmove',
            callback: moveHandler.bind(this),
            eventOptions: {
                passive: true
            }
        });
        this.domWatcher.add({
            element: this.root, on: 'mousemove',
            callback: moveHandler.bind(this),
            eventOptions: {
                passive: true
            }
        });
        this.domWatcher.add({
            element: this.root, on: 'drag',
            callback: moveHandler.bind(this),
            eventOptions: {
                passive: true
            }
        });

        const outHandler = (e: any) => {
            if (!this.mouseState.down) {
                return;
            }
            this.raf.write(() => {
                this.root.classList.remove('dragging');
            })
            this.mouseState.down = false;

            if (this.useSnapToClosest) {
                let index = this.findClosestIndexToX(this.targetX);
                this.slideTo(index, false);
            }
        };

        this.domWatcher.add({
            element: this.root, on: 'touchend',
            callback: outHandler.bind(this),
            eventOptions: { passive: true }
        });
        this.domWatcher.add({
            element: this.root, on: 'mouseup', callback: outHandler.bind(this),
            eventOptions: { passive: true },
        });
        this.domWatcher.add({
            element: this.root, on: 'dragend', callback: outHandler.bind(this),
            eventOptions: { passive: true },
        });
        this.domWatcher.add({
            element: this.root, on: 'mouseleave', callback: outHandler.bind(this),
            eventOptions: { passive: true },
        });
    }


    private onWindowResize(): void {
        this.windowWidth = window.innerWidth;
        this.calculateChildPositions();

        if (this.useSnapToClosest) {
            let index = this.findClosestIndexToX(this.currentX);
            this.slideTo(index, false);
            this.draw(true);
        }
    }


    calculateChildPositions() {
        this.childrenPositions = [];
        this.items.forEach((child) => {
            let baseX = this.currentX;
            let bounds = child.getBoundingClientRect();
            let x = bounds.left + baseX;
            let width = child.offsetWidth;
            let baseWidth = this.root.offsetWidth;
            this.childrenPositions.push({
                el: child,
                x: x,
                // Center position relative to window size.
                centerX: x - ((baseWidth * 0.5) - (width * 0.5)),
                width: width,
            });
        });

        this.scrollWidth = this.root.offsetWidth;

    }

    setScrollPosition(x: number) {
        this.currentX = x;
        if (this.useCssVar) {
            dom.setCssVariables(this.root, {
                '--horizontal-scroll-x': -this.currentX + 'px'
            })
        } else {
            this.root.scrollLeft = this.currentX;
        }
    }


    public prev() {
        this.slideTo(this.index - 1);
    }

    public next() {
        this.slideTo(this.index + 1);
    }


    /**
     * Slides to a specific index.
     */
    public slideTo(index: number, instant = false) {

        // Wrapping?
        // if (index == -1) {
        //     index = this.childrenPositions.length - 1;
        // }
        // if (index > this.childrenPositions.length - 1) {
        //     index = 0;
        // }
        if (index == -1) {
            return;
        }
        if (index > this.childrenPositions.length - 1) {
            return;
        }


        if (instant) {
            this.setScrollPosition(this.getChildPosition(index).centerX);
        }

        this.targetX = this.getChildPosition(index).centerX;
        this.index = index;

        this.raf && this.raf.write(() => {
            this.childrenPositions[this.index].el.classList.remove('slide-active');
            this.childrenPositions[this.index].el.classList.add('slide-active');
        })
    }

    public isFirstSlide() {
        return this.index == 0;
    }


    public isLastSlide() {
        return this.index >= this.childrenPositions.length - 1
    }

    getChildPosition(index: number) {
        if (index == -1) {
            return this.childrenPositions[this.childrenPositions.length - 1];
        }

        if (index > this.childrenPositions.length - 1) {
            return this.childrenPositions[0];
        }

        return this.childrenPositions[index];
    }



    findClosestIndexToX(x: number) {
        let index;
        let distance = 10000;
        this.childrenPositions.forEach((position, i) => {
            let diff = Math.abs(position.x - x);
            if (diff <= distance) {
                index = i;
                distance = diff;
            }
        });
        return index;
    }


    /**
     * Turns off and on snapping.
     * @param value
     */
    public enableSnapToClosest(value: boolean) {
        this.useSnapToClosest = value;
    }

    /**
     * Turns on or off css var mode.
     * @param value
     */
    public enableCssVar(value: boolean) {
        this.useCssVar = value;
    }


    /**
     * Whether to add css var that indicate the current delta value of the
     * css var.
     */
    public enableSlideDeltaValues(value: boolean) {
        this.useSlideDeltaValues = value;
        this.draw(true);
    }



    /**
     * Allows you to add extra groups of html elements to add css effects to.  Each group
     * must be the same length as the number of slides in the system.
     *
     * @param elementGroups
     *
     * Example:
     * ```
     * var chapters = Array.from(document.querySelectorAll('.chapters'));
     *
     * // Now add them.
     * hr.addSlideDeltaValuesToElements([chapters]);
     *
     *
     * ```
     */
    public addSlideDeltaValuesToElements(elementGroups: Array<Array<HTMLElement>>) {
        // Loop through to check each group length matches the number of slides.
        this.slideDeltaValuesElements.forEach((group: Array<HTMLElement>) => {
            if (group.length !== this.childrenPositions.length) {
                throw new Error("The group you pass does not have the same number of elements as slides");
            }
        })

        this.slideDeltaValuesElements = elementGroups;
        this.draw(true);
    }


    public dispose(): void {
        this.raf.dispose();
        this.rafEv.dispose();
        this.domWatcher.dispose();
    }

}