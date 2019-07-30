

import { RafProgress } from '../lib/raf/raf-progress';
import { DomWatcher } from '../lib/dom/dom-watcher';
import { EASE } from '../lib/ease/ease';
import { dom } from '../lib/dom/dom';
import { func } from '../lib/func/func';
import { elementVisibility } from '../lib/dom/element-visibility';
import { CssVarInterpolate } from '../lib/interpolate/css-var-interpolate';

export default class CssVarInterpolateSample3 {
    constructor() {
        console.log('css var interpolate');

        this.domWatcher = new DomWatcher();
        this.parentElement = document.getElementById("parent");
        this.childElement = document.getElementById("child");

        // Element visibility.  Add 100px before and after the module.
        this.ev = elementVisibility.inview(this.parentElement, { rootMargin: '100px' });

        // Instance of rafProgress.
        this.rafProgress = new RafProgress();

        // Update the progress value per scroll.
        let throttleThreshold = 24;
        this.domWatcher.add({
            element: window,
            on: 'scroll',
            // Throttle the scroll.
            callback: func.throttle((event) => {
                this.onScroll();
            }, throttleThreshold),
            // Run scroll updates only when the element is visible.
            runWhen: () => {
                return this.ev.state().ready && this.ev.state().inview;
            },
            eventOptions: { passive: true }
        });


        // On init, immediately update the raf progress without lerping.
        this.progress =
            dom.getElementScrolledPercent(this.parentElement);
        this.rafProgress.easeTo(this.progress, 1, EASE.Linear);
        this.rafProgress.watch(this.onProgressUpdate.bind(this));


        // Setup css var interpolate.
        this.cssVarInterpolate = new CssVarInterpolate(
            // This is the element the css variables get scoped to.
            this.parentElement,
            {
                interpolations: [
                    {
                        progress: [
                            { from: 0, to: 1, start: '0px', end: '500px' },
                        ],
                        id: '--x'
                    },
                    {
                        progress: [
                            { from: 0, to: 0.2, start: '0px', end: '100px', easingFunction: EASE.easeOutSine },
                            { from: 0.2, to: 0.3, start: '100px', end: '300px', easingFunction: EASE.easeOutSine },
                            { from: 0.3, to: 0.5, start: '300px', end: '0px', easingFunction: EASE.easeOutSine },
                            { from: 0.5, to: 1, start: '0px', end: '500px', easingFunction: EASE.easeInQuad },
                        ],
                        id: '--y'
                    },
                ]
            }
        );


        // Run scroll once.
        this.domWatcher.run('scroll');
    }

    onScroll() {
        // Calculate 'how much' we have scrolled into the parent element from 0-1.
        // Optionally add offset to this if needed.
        this.progress =
            dom.getElementScrolledPercent(this.parentElement);
        this.rafProgress.easeTo(this.progress, 0.25, EASE.Linear);
    }


    // Runs every time eased progress is updated.
    onProgressUpdate(easedProgress, direction) {
        this.cssVarInterpolate.update(easedProgress);
    }


    dispose() {
        this.domWatcher.dispose();
        this.ev.dispose();
    }
}