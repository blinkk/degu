import * as $ from 'jquery';
import {dom} from '../dom/dom';
import {mathf} from '../mathf/mathf';
import {
  elementVisibility,
  ElementVisibilityObject,
} from '../dom/element-visibility';
import {DomWatcher} from '../dom/dom-watcher';

export interface ScrollPointsConfig {
  triggerElement: HTMLElement;
  // How much of the trigger element should be visible to trigger.
  triggerThreshold: number;
  // The direction in which the trigger should happen. 1 means this would only
  // trigger when going down. -1 would trigger only when going up and 0 would
  // trigger for both up and down.
  triggerDirection: number;
  targetElement: HTMLElement;

  // The amount of scroll that should happen for every 1 second duration.
  // This is in effect, the "speed" of scroll but rather sets the duration
  // to be a factor of distance (meaning the scroll is always a constant speed
  // independent of distance).
  scrollDistanceEvery1Second?: number;
  // When the trigger happens, what position - location the scroll should go to.
  // relative to the top of the window.
  targetElementOffsetFromTopOfWindow: Function;

  // Whether to use a native smooth scroll.
  // Native scroll will work better but the speed of travel
  // can't be controlled and may differ based on the distance
  // of travel.  Turning this on, makes it run it via a JS
  // based window scroll in which the travel speed factors
  // the distance it needs to travel (per scrollDistanceEvery1Second)
  forceNativeScroll: boolean;
}

/**
  A class that scrolls the window to a targetElement when a given
  trigger element becomes visible on the page.


  Given a trigger and target, here is an example that says,
  when 20% of the trigger element is visible, then scroll to the
  top of the target element.

  The trigger and target can be the same element.
 ```
 <div trigger>
    <div target></div>
 </div>


 new ScrollPoints({
    triggerElement: triggerElement,
    triggerThreshold:  0.2,
    triggerDirection: -1
    targetElement: targetElement,
    targetElementOffsetFromTopOfWindow: (trigger:HTMLElement, targetElement:HTMLElement)=> {
        return 0;
    }
 })

 ```
 */
export class ScrollPoints {
  private config: ScrollPointsConfig;
  private ev: ElementVisibilityObject;
  private domWatcher: DomWatcher;
  private y = 0;
  private prevY = 0;
  private scrollDirection = 0;
  private scrolling = false;
  private jQuery: JQueryStatic;

  constructor(config: ScrollPointsConfig) {
    this.config = config;
    this.jQuery = $;

    this.domWatcher = new DomWatcher();
    this.domWatcher.add({
      element: window,
      on: 'scroll',
      callback: this.onWindowScroll.bind(this),
      eventOptions: {passive: true},
    });
    this.onWindowScroll();

    this.ev = elementVisibility.inview(
      this.config.triggerElement,
      {threshold: this.config.triggerThreshold || 0},
      (element: any, changes: any) => {
        if (changes.isIntersecting) {
          this.engage();
        } else {
          this.disengage();
        }
      }
    );
  }

  private getOffset() {
    return this.config.targetElementOffsetFromTopOfWindow
      ? this.config.targetElementOffsetFromTopOfWindow()
      : 0;
  }

  private onWindowScroll() {
    this.prevY = this.y;
    this.y = window.scrollY;
    this.scrollDirection = mathf.direction(this.prevY, this.y);
  }

  private engage(): void {
    if (this.scrolling) {
      return;
    }

    // Engage only when scroll directions match with config specification.
    if (this.config.triggerDirection == -1 && this.scrollDirection != -1) {
      return;
    }

    if (this.config.triggerDirection == 1 && this.scrollDirection != 1) {
      return;
    }

    this.config.targetElement.classList.add('scroll-point-engaged');

    // Native scroll.
    if (this.config.forceNativeScroll) {
      window.scrollTo({
        top: dom.getScrollTop(this.config.targetElement) + this.getOffset(),
        left: 0,
        behavior: 'smooth',
      });
    } else {
      // TODO (uxder): replace jquery based scroll.  Probably use rafTimer.
      const page = this.jQuery('body, html');
      const top =
        dom.getScrollTop(this.config.targetElement) + this.getOffset();
      const animationComplete = () => {
        this.scrolling = false;
        page.off(
          'scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove'
        );
        page.stop();
      };

      page.on(
        'scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove',
        animationComplete
      );

      // Calculate the duration.  The duration should factor in the current distance.
      const distance = Math.abs(window.scrollY - top);

      // 1 second for base distance.
      const base = this.config.scrollDistanceEvery1Second || 1000;
      const duration = (distance / base) * 1000;
      this.scrolling = false;

      page.stop().animate(
        {
          scrollTop: top,
        },
        duration,
        animationComplete
      );
    }
  }

  private disengage(): void {
    this.config.targetElement.classList.remove('scroll-point-engaged');
  }

  public dispose(): void {
    this.ev.dispose();
    this.domWatcher.dispose();
  }
}
