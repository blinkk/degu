
import {dom} from '../dom/dom';
import {mathf} from '../mathf/mathf';
import { elementVisibility, ElementVisibilityObject } from '../dom/element-visibility';
import { DomWatcher } from '../dom/dom-watcher';

export interface ScrollPointsConfig {
    triggerElement: HTMLElement,
    // How much of the trigger element should be visible to trigger.
    triggerThreshold: number,
    // The direction in which the trigger should happen. 1 means this would only
    // trigger when going down. -1 would trigger only when going up and 0 would
    // trigger for both up and down.
    triggerDirection: number,
    targetElement: HTMLElement,

    // When the trigger happens, what position - location the scroll should go to.
    // relative to the top of the window.
    targetElementOffsetFromTopOfWindow: Function
};


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
    private y: number = 0;
    private prevY: number = 0;
    private scrollDirection: number = 0;

    constructor(config: ScrollPointsConfig) {
        this.config = config;

        this.domWatcher = new DomWatcher();
        this.domWatcher.add({
            element: window,
            on: 'scroll',
            callback: this.onWindowScroll.bind(this),
            eventOptions: { passive: true }
        })
        this.onWindowScroll();

        this.ev = elementVisibility.inview(
            this.config.triggerElement,
            { threshold: this.config.triggerThreshold || 0},
            (element: any, changes: any) => {
                if(changes.isIntersecting) {
                    this.engage();
                } else {
                    this.disengage();
                }
            });
    }

    private getOffset() {
        return this.config.targetElementOffsetFromTopOfWindow ?
            this.config.targetElementOffsetFromTopOfWindow() : 0;
    }


    private onWindowScroll() {
        this.prevY = this.y;
        this.y = window.scrollY;
        this.scrollDirection = mathf.direction(this.prevY, this.y);
    }


    private engage():void {
        // Engage only when scroll directions match with config specification.
        if(this.config.triggerDirection == -1 && this.scrollDirection != -1) {
            return;
        }

        if(this.config.triggerDirection == 1 && this.scrollDirection != 1) {
            return;
        }


        this.config.targetElement.classList.add('scroll-point-engaged');
        window.scrollTo({
            top: dom.getScrollTop(this.config.targetElement) + this.getOffset(),
            left: 0,
            behavior: 'smooth'
        });
    }


    private disengage():void {
        this.config.targetElement.classList.remove('scroll-point-engaged');
    }



    public dispose():void {
        this.ev.dispose();
        this.domWatcher.dispose();
    }
}
