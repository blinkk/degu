

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
 * hr.setSnapToClosest(false);
 * ```
 *
 *
 * # Use css variable mode.  This will set a css variable with the offset value.
 *   This allows you to set the scroll position with transformX instead of scrollLeft
 *   for perf boosts.
 * ```
 * hr.setUseCssVar(true);
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
 */
export class HorizontalScrollElement {
    private root: HTMLElement;
    private domWatcher: DomWatcher;
    private mouseState: HorizontalScrollElementMouseState;
    private currentX: number = 0;
    private targetX: number = 0;
    private rafEv: ElementVisibilityObject;
    private raf: Raf;
    private snapToClosets: boolean = true;
    private items: Array<HTMLElement>;
    private childrenPositions: Array<HorizontalScrollElementPositions>;
    private index: number = 0;
    private useCssVar: boolean = false;

    constructor(rootElement: HTMLElement) {
        this.root = rootElement;
        this.items = Array.from(this.root.children) as Array<HTMLElement>;

        this.domWatcher = new DomWatcher();
        this.domWatcher.add({
            element: window,
            on: 'smartResize',
            callback: this.onWindowResize.bind(this),
        });
        this.onWindowResize();
        this.raf = new Raf(this.onRaf.bind(this));
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
        this.slideTo(0);
    }

    private onRaf(): void {
        const currentX = this.currentX;
        if (this.currentX == this.targetX) {
            return;
        }
        let dampedTarget = mathf.damp(
            currentX, this.targetX, 0.4, 0.2);
        this.setScrollPosition(dampedTarget);
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
            this.root.classList.add('dragging');
        };
        this.domWatcher.add({
            element: this.root, on: 'touchstart', callback: downHandler.bind(this),
        });
        this.domWatcher.add({
            element: this.root, on: 'mousedown', callback: downHandler.bind(this),
        });
        this.domWatcher.add({
            element: this.root, on: 'dragstart', callback: downHandler.bind(this),
        });

        // Prevent drags.
        this.domWatcher.add({
            element: this.root, on: 'dragover', callback: (e:any)=> {
                e.preventDefault();
            },
        });
        this.domWatcher.add({
            element: this.root, on: '', callback: (e:any)=> {
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
                let normalizedWindowSize = mathf.inverseLerp(300, 2000, window.innerWidth);
                let dragSensitivity = mathf.lerp(1.4, 2, normalizedWindowSize);
                this.targetX += diff * dragSensitivity;
                this.mouseState.lastX = this.mouseState.x;
            }
        };

        this.domWatcher.add({
            element: this.root, on: 'touchmove', callback: moveHandler.bind(this),
        });
        this.domWatcher.add({
            element: this.root, on: 'mousemove', callback: moveHandler.bind(this),
        });
        this.domWatcher.add({
            element: this.root, on: 'drag', callback: moveHandler.bind(this),
        });

        const outHandler = (e: any) => {
            if (!this.mouseState.down) {
                return;
            }
            this.root.classList.remove('dragging');
            this.mouseState.down = false;

            if (this.snapToClosets) {
                let index = this.findClosestIndexToX(this.targetX);
                this.slideTo(index, false, true);
            }
        };

        this.domWatcher.add({
            element: this.root, on: 'touchend',
            callback: outHandler.bind(this), eventOptions: { passive: true }
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

        if (this.snapToClosets) {
            let index = this.findClosestIndexToX(this.currentX);
            this.slideTo(index, false, true);
        }

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
        this.slideTo(this.index--);
    }

    public next() {
        this.slideTo(this.index++);
    }


    /**
     * Slides to a specific index.
     */
    public slideTo(index: number, instant = false) {
        if (index == -1) {
            index = this.childrenPositions.length - 1;
        }
        if (index > this.childrenPositions.length - 1) {
            index = 0;
        }

        if (instant) {
            this.setScrollPosition(this.getChildPosition(index).centerX);
        }
        this.targetX = this.getChildPosition(index).centerX;

        this.childrenPositions[this.index].el.classList.remove('slide-active');
        this.index = index;
        this.childrenPositions[this.index].el.classList.add('slide-active');
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
    public setSnapToClosest(value: boolean) {
        this.snapToClosets = value;
    }

    /**
     * Turns on or off css var mode.
     * @param value
     */
    public setUseCssVar(value: boolean) {
        this.useCssVar = value;
    }



    public dispose(): void {
        this.raf.dispose();
        this.rafEv.dispose();
        this.domWatcher.dispose();
    }

}