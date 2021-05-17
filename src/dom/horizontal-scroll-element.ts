import {elementVisibility, ElementVisibilityObject} from './element-visibility';
import {DomWatcher} from './dom-watcher';
import {mathf} from '../mathf/mathf';
import {dom} from './dom';
import {Raf} from '../raf/raf';
import {func} from '..';

export const HorizontalScrollElementEvents = {
  INDEX_CHANGE: 'horizontal-scroll-element-index-change',
};

export interface HorizontalScrollElementConfig {
  /**
   * The root element to create the horizontal scroll element.
   */
  rootElement: HTMLElement;

  /**
   * Defaults to false but if set to true, the first time the root element
   * is visible in the viewport, it will be quickly resized.  This can be
   * useful for rare cases in which the carousel is instantiated at a given
   * size but actually rendered at a different one such as a carousel
   * within a modal.
   */
  resizeOnFirstEv?: boolean;

  /**
   * Whether to use slide delta values.
   */
  slideDeltaValues?: boolean;

  /**
   * Whether to use scroll snapping.
   */
  snapToClosest?: boolean;

  /**
   * Delay resizing by a given ms amount.  Defaults to no delay.
   */
  delayResizeMs: number;

  /**
   * Whether to left align.  Defaults to false and centers.
   * If using leftAlign, it is common to want a margin on the ends.  Add padding to
   * the scroll element to achieve this.
   *
   *
   * ```
   * [scroll-track]
   *   margin-left: var(--grid-side)
   *
   *[scroll-item]:last-child
   *   padding-right: var(--grid-side)
   * ```
   *
   *
   */
  leftAlign?: boolean;

  /**
   * When dragging, allow a little wiggle room.  Defaults to 0
   */
  dragBounce?: number;
}

export interface HorizontalScrollElementMouseState {
  x: number;
  down: boolean;
  dragging: boolean;
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
 * Notice: Experimental Class
 * This class was written fairly quickly and might change in the future.
 * Maybe?  use it as a reference.
 *
 *
 * This is useful in creating a draggable horizontal scroll area that is draggable.
 * This like a horizontal carousel basically.
 * The items will get centered in position.
 *
 * ```
 * <div class="scroll" id="myscroller">
 *
 *   <div class="scroll__track" scroll-track>
 *
 *     <div class="scroll-item" scroll-item>
 *      <div class="scroll-item__inner" scroll-inner>...</div>
 *     </div>
 *     <div class="scroll-item" scroll-item>
 *        <div class="scroll-item__inner" scroll-inner>...</div>
 *     </div>
 *     <div class="scroll-item" scroll-item>
 *        <div class="scroll-item__inner" scroll-inner>...</div>
 *     </div>
 *     ...
 *
 *   </div>
 * </div>
 *
 *
 * const hr = new HorizontalScrollElement({
 *   rootElement: document.getElementById('myscroller'),
 *   resizeOnFirstEv: false,
 *   slideDeltaValues: true,
 *   snapToClosest: true,
 * });
 * ```
 *
 * Sample css to go with it.
 *
 * - while dragging, the root element will receive a "dragging" css class.
 * - the active child element will receive a "slide-active" class.
 * - use scroll-item__inner (the inner element) to size your items.
 * - scrolling works based on translateX(var(--horizontal-scroll-x))
 *
 * ```
 * #myscroller
 *   width: 100%
 *   display: flex
 *   overflow-x: scroll
 *   overflow-y: hidden
 *   -webkit-overflow-scrolling: touch
 *   transition: 0.2s all ease
 *   transform: scale(1.0)
 *   user-drag: none
 *   &.resizing *
 *     transition: none !important
 *     animation: none !important
 *
 *
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
 *   &.dragging a
 *     pointer-events: none
 *   [scroll-track]
 *     display: flex
 *     position: relative
 *     transform: translateX(var(--horizontal-scroll-x))
 *     will-change: transform
 *   [scroll-item]
 *       position: relative
 *       &:hover
 *       cursor: grab
 *   [scroll-inner]
 *
 *     position: relative
 *     width: 85vw
 *     margin-right: 16px
 *     margin-left: 16px
 *     max-width: 1272px
 *     +sd-lt
 *       margin-left: 12px
 *       margin-right: 12px
 *     +md-lt
 *     margin-left: 12px
 *      margin-right: 12px
 *   [scroll-item]:first-child [scroll-inner]
 *     +sd-lt
 *       margin-left: -24px
 *     +md-lt
 *       margin-left: 0px
 * .myscroll img
 *   point-events: none
 * ```
 *
 *
 * # Turn on snapping
 * The carousel defaults to a free flowing carousel but it can be turned to snap
 * by running the following method.
 *
 * ```
 * hr.enableSnapToClosest(true);
 * ```
 *
 *
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
 * ## Events
 *
 * ```
 * this.rootElement.addEventListener(HorizontalScrollElementsEvents.INDEX_CHANGE, (event)=> {
 *     console.log(event.detail.index);
 * })
 *
 * ```
 *
 *
 * # Troubleshooting
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
 * ## Resizing messes up!
 * When resizing happens, the carousel scans the sizes of the inner
 * elements.  This means that if you are translating sizing, it might
 * still be in the middle of fixing the size.
 *
 *
 * Look out for things like this where you are transiting everything (all):
 *
 * ```
 *   transition: 0.3s all ease-in-out
 * ```
 *
 * Switch them to only what you need
 *
 * ```
 *   transition: 0.3s opacity ease-in-out
 * ```
 *
 * If you still can't solve it, pass a delay value to the delayResizeMs in the config.
 *
 *
 */
export class HorizontalScrollElement {
  private root: HTMLElement;
  private domWatcher: DomWatcher;
  private mouseState: HorizontalScrollElementMouseState;
  private currentX = 0;
  private targetX = 0;
  private rafEv: ElementVisibilityObject;
  private raf: Raf;
  private useSnapToClosest = false;
  private shouldLeftAlign = false;
  private items: Array<HTMLElement>;
  private childrenPositions: Array<HorizontalScrollElementPositions> = [];
  private index = 0;
  private useSlideDeltaValues = false;
  private rootWidth = 0;
  private scrollWidth = 0;
  private firstItemCenterOffset = 0;
  private lastItemCenterOffset = 0;
  private slideDeltaValuesElements: Array<Array<HTMLElement>> = [];
  private ranFirstEv = false;
  private windowWidth = 0;
  private dragBounce: number;
  private resizing = false;
  private itemCount = 0;

  constructor(config: HorizontalScrollElementConfig) {
    this.root = config.rootElement;
    this.raf = new Raf(this.onRaf.bind(this));
    this.useSlideDeltaValues = !!config.slideDeltaValues;
    this.useSnapToClosest = !!config.snapToClosest;
    this.shouldLeftAlign = !!config.leftAlign;
    this.dragBounce = config.dragBounce || 100;

    this.items = Array.from(
      this.root.querySelectorAll('[scroll-item]')
    ) as Array<HTMLElement>;

    this.domWatcher = new DomWatcher();
    this.domWatcher.add({
      element: window,
      on: 'smartResize',
      callback: func.debounce(() => {
        if (config.delayResizeMs) {
          window.setTimeout(() => {
            this.onWindowResize();
          }, +config.delayResizeMs);
        } else {
          this.onWindowResize();
        }
      }, 200),
      eventOptions: {
        passive: true,
      },
    });

    this.mouseState = {
      x: 0,
      down: false,
      dragging: false,
      start: 0,
      lastX: 0,
    };

    this.rafEv = elementVisibility.inview(
      this.root,
      {},
      (element: HTMLElement, changes: IntersectionObserverEntry) => {
        if (changes.isIntersecting) {
          if (!this.ranFirstEv && !!config.resizeOnFirstEv) {
            this.onWindowResize(true);
          }
          this.raf.start();
          this.ranFirstEv = true;
        } else {
          this.raf.stop();
        }
      }
    );

    this.index = 0;
    this.onWindowResize();
    this.setupMouseDrag();
    this.draw(true);
  }

  private onRaf(): void {
    this.raf.write(() => {
      this.draw();
    });
  }

  public draw(immediate = false) {
    if (!this.childrenPositions || !this.childrenPositions.length) {
      this.onWindowResize();
      return;
    }

    const currentX = mathf.roundToPrecision(this.currentX, 3);

    if (currentX === this.targetX && !immediate) {
      return;
    }
    let dampedTarget = mathf.damp(currentX, this.targetX, 0.4, 0.2);

    // No lerp when immediate
    if (immediate) {
      dampedTarget = this.targetX;
    }
    this.setScrollPosition(dampedTarget);

    if (this.useSlideDeltaValues) {
      this.childrenPositions.forEach((child, i) => {
        const current = this.currentX;
        const delta = child.centerX - current;
        const percent = delta / this.rootWidth;
        const halfPercent = mathf.inverseLerp(0, 0.5, percent, true);
        const quartPercent = mathf.inverseLerp(0, 0.25, percent, true);

        dom.setCssVariables(child.el, {
          '--horizontal-scroll-in-x': String(percent),
          '--horizontal-scroll-in-x-half': String(halfPercent),
          '--horizontal-scroll-in-x-quart': String(quartPercent),
          '--horizontal-scroll-in-x-abs': String(Math.abs(percent)),
          '--horizontal-scroll-in-x-abs-half': String(Math.abs(halfPercent)),
          '--horizontal-scroll-in-x-abs-quart': String(Math.abs(quartPercent)),
          '--horizontal-scroll-in-x-abs-inv': String(1 - Math.abs(percent)),
          '--horizontal-scroll-in-x-abs-inv-half': String(
            1 - Math.abs(halfPercent)
          ),
          '--horizontal-scroll-in-x-abs-inv-quart': String(
            1 - Math.abs(quartPercent)
          ),
        });

        // Add the same css value to associated slieDeltaValueElements
        this.slideDeltaValuesElements.forEach((group: Array<HTMLElement>) => {
          dom.setCssVariables(group[i], {
            '--horizontal-scroll-in-x': String(percent),
            '--horizontal-scroll-in-x-half': String(halfPercent),
            '--horizontal-scroll-in-x-quart': String(quartPercent),
            '--horizontal-scroll-in-x-abs': String(Math.abs(percent)),
            '--horizontal-scroll-in-x-abs-half': String(Math.abs(halfPercent)),
            '--horizontal-scroll-in-x-abs-quart': String(
              Math.abs(quartPercent)
            ),
            '--horizontal-scroll-in-x-abs-inv': String(1 - Math.abs(percent)),
            '--horizontal-scroll-in-x-abs-inv-half': String(
              1 - Math.abs(halfPercent)
            ),
            '--horizontal-scroll-in-x-abs-inv-quart': String(
              1 - Math.abs(quartPercent)
            ),
          });
        });
      });
    }
  }

  private setupMouseDrag() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const downHandler = (e: any) => {
      const eventX = (e.touches && e.touches[0].clientX) || e.x;
      this.mouseState = {
        x: eventX,
        down: true,
        dragging: false,
        lastX: eventX,
        start: eventX,
      };
      this.setTargetX(this.currentX);
    };
    this.domWatcher.add({
      element: this.root,
      on: 'touchstart',
      callback: downHandler.bind(this),
      eventOptions: {
        passive: true,
      },
    });
    this.domWatcher.add({
      element: this.root,
      on: 'mousedown',
      callback: downHandler.bind(this),
      eventOptions: {
        passive: true,
      },
    });
    this.domWatcher.add({
      element: this.root,
      on: 'dragstart',
      callback: downHandler.bind(this),
      eventOptions: {
        passive: true,
      },
    });

    // Prevent drags.
    this.domWatcher.add({
      element: this.root,
      on: 'dragover',
      callback: (e: Event) => {
        e.preventDefault();
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moveHandler = (e: any) => {
      if (
        !this.mouseState.dragging &&
        this.mouseState.down &&
        this.mouseState.lastX !== this.mouseState.start
      ) {
        this.mouseState.dragging = true;
        this.raf.write(() => {
          this.root.classList.add('dragging');
        });
      }

      const eventX = (e.touches && e.touches[0].clientX) || e.x;
      if (this.mouseState.down) {
        this.mouseState.x = eventX;
        const diff = this.mouseState.lastX - this.mouseState.x;
        // Drag sensititiy.  The higher the less effort requires to move around.
        // Make it less sensitive towards mobile.
        const normalizedWindowSize = mathf.inverseLerp(
          300,
          3000,
          this.windowWidth
        );
        const dragSensitivity = mathf.lerp(3, 4, normalizedWindowSize);
        this.setTargetX(this.targetX + diff * dragSensitivity);
        this.mouseState.lastX = this.mouseState.x;
      }
    };

    this.domWatcher.add({
      element: this.root,
      on: 'touchmove',
      callback: moveHandler.bind(this),
      eventOptions: {
        passive: true,
      },
    });
    this.domWatcher.add({
      element: this.root,
      on: 'mousemove',
      callback: moveHandler.bind(this),
      eventOptions: {
        passive: true,
      },
    });
    this.domWatcher.add({
      element: this.root,
      on: 'drag',
      callback: moveHandler.bind(this),
      eventOptions: {
        passive: true,
      },
    });

    const outHandler = () => {
      if (!this.mouseState.down) {
        return;
      }
      this.raf.write(() => {
        this.root.classList.remove('dragging');
      });
      this.mouseState.dragging = false;
      this.mouseState.down = false;

      if (this.useSnapToClosest) {
        const index = this.findClosestIndexToX(this.targetX);
        this.slideTo(index, false);
      }
    };

    this.domWatcher.add({
      element: this.root,
      on: 'touchend',
      callback: outHandler.bind(this),
      eventOptions: {passive: true},
    });
    this.domWatcher.add({
      element: this.root,
      on: 'mouseup',
      callback: outHandler.bind(this),
      eventOptions: {passive: true},
    });
    this.domWatcher.add({
      element: this.root,
      on: 'dragend',
      callback: outHandler.bind(this),
      eventOptions: {passive: true},
    });
    this.domWatcher.add({
      element: this.root,
      on: 'mouseleave',
      callback: outHandler.bind(this),
      eventOptions: {passive: true},
    });
  }

  private onWindowResize(immediate = false): void {
    this.root.classList.add('resizing');
    window.setTimeout(
      () => {
        this.calculateChildPositions();

        if (this.useSnapToClosest) {
          this.slideTo(this.index, true);
        }
        this.root.classList.remove('resizing');
        // Not sure why but annoyingly, there are occassional cases where resizing
        // messes up especially combined with lazyimage.  Adding some time here
        // helps as a temporary solution.
      },
      immediate ? 0 : 100
    );
  }

  calculateChildPositions() {
    if (this.items.length === 0) {
      return;
    }

    this.windowWidth = window.innerWidth;
    this.mouseState = {
      x: 0,
      down: false,
      dragging: false,
      start: 0,
      lastX: 0,
    };

    this.childrenPositions = [];
    this.items.forEach(child => {
      const x = child.offsetLeft;
      const width = child.offsetWidth;

      // console.log('item width', itemWidth, this.itemCount);
      const baseWidth = this.root.offsetWidth;
      this.childrenPositions.push({
        el: child,
        x: x,
        // Center position relative to window size.
        centerX: this.shouldLeftAlign ? x : x - (baseWidth * 0.5 - width * 0.5),
        width: width,
      });
    });

    this.rootWidth = this.root.offsetWidth;
    // Add currentX to account for the current position.
    this.scrollWidth = this.root.scrollWidth + this.currentX;
    this.firstItemCenterOffset = this.childrenPositions[0].centerX;
    this.lastItemCenterOffset =
      this.childrenPositions[this.childrenPositions.length - 1].centerX;

    // If we are in left align mode, the index count
    // is calculated differently.  The last index
    // would be the element in which the last element is
    // full in view.
    this.itemCount = this.childrenPositions.length - 1;
    if (this.shouldLeftAlign) {
      const visibleWidth = this.scrollWidth - this.rootWidth;
      const itemWidth = this.childrenPositions[0].width;
      this.itemCount = Math.ceil(visibleWidth / itemWidth);
    }

    this.currentX = 0;
    this.targetX = 0;
  }

  setScrollPosition(x: number) {
    this.currentX = x;

    dom.setCssVariables(this.root, {
      '--horizontal-scroll-x': -this.currentX + 'px',
    });
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
    // if (index === -1) {
    //     index = this.childrenPositions.length - 1;
    // }
    // if (index > this.childrenPositions.length - 1) {
    //     index = 0;
    // }
    if (index === -1) {
      return;
    }
    if (index > this.itemCount) {
      return;
    }

    this.setTargetX(this.getChildPosition(index).centerX);
    this.index = index;

    if (instant) {
      this.setScrollPosition(this.getChildPosition(index).centerX);
      this.childrenPositions[this.index].el.classList.remove('slide-active');
      this.childrenPositions[this.index].el.classList.add('slide-active');
    } else {
      this.raf &&
        this.raf.write(() => {
          this.childrenPositions[this.index].el.classList.remove(
            'slide-active'
          );
          this.childrenPositions[this.index].el.classList.add('slide-active');
        });
    }

    // Fire a notification that the index has changed.
    dom.event(this.root, HorizontalScrollElementEvents.INDEX_CHANGE, {
      index: this.index,
    });
  }

  public setTargetX(x: number) {
    const dragBounce = this.mouseState.dragging ? this.dragBounce : 0;
    // Clamp
    if (this.shouldLeftAlign) {
      this.targetX = Math.min(
        x,
        this.scrollWidth - this.windowWidth + dragBounce
      );
      this.targetX = Math.max(
        this.targetX,
        this.firstItemCenterOffset - dragBounce
      );
    } else {
      this.targetX = Math.min(x, this.lastItemCenterOffset + dragBounce);
      this.targetX = Math.max(
        this.targetX,
        this.firstItemCenterOffset - dragBounce
      );
    }
  }

  public isFirstSlide() {
    return this.index === 0;
  }

  public isLastSlide() {
    return this.index >= this.itemCount;
  }

  getChildPosition(index: number) {
    if (index === -1) {
      return this.childrenPositions[this.childrenPositions.length - 1];
    }

    if (index > this.childrenPositions.length - 1) {
      return this.childrenPositions[0];
    }

    return this.childrenPositions[index];
  }

  findClosestIndexToX(x: number): number {
    let index = -1;
    let distance = 10000;

    this.childrenPositions.forEach((position, i) => {
      const diff = Math.abs(position.x - x);
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
  public addSlideDeltaValuesToElements(
    elementGroups: Array<Array<HTMLElement>>
  ) {
    // Loop through to check each group length matches the number of slides.
    this.slideDeltaValuesElements.forEach((group: Array<HTMLElement>) => {
      if (group.length !== this.childrenPositions.length) {
        throw new Error(
          'The group you pass does not have the same number of elements as slides'
        );
      }
    });

    this.slideDeltaValuesElements = elementGroups;
    this.draw(true);
  }

  public dispose(): void {
    this.raf.dispose();
    this.rafEv.dispose();
    this.domWatcher.dispose();
  }
}
