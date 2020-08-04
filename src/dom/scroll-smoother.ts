
import { DomWatcher } from './dom-watcher';
import { mathf } from '../mathf/mathf';
import { Raf } from '../raf/raf';

export interface ScrollSmootherConfig {
    lerp: number,
    damp: number,
    root: HTMLElement,
    onUpdate?: Function
    topMode?: boolean
}

/**
 * Yes, it's a class to scroll jack.  Technically, what this does it attempt to
 * add a smooth damp the scrollY position to make the "mouse" experience better.
 *
 *
 * Usage is simple:
 * ```
 * <body>
 *   <div id="root">...my website</div>
 * </body>
 *
 *
 * const scrollSmoother = new ScrollSmoother({
 *  lerp: 0.23
 *  damp: 0.2444,
 *  root: document.getElementById('root')
 * })
 *
 * scrollSmoother.run();
 *
 *
 *
 * Optional callback
 * const scrollSmoother = new ScrollSmoother({
 *  lerp: 0.23
 *  damp: 0.2444,
 *  root: document.getElementById('root'),
 *  onUpdate: (currentY, targetY)=> {
 *    ...
 *  }
 * })
 *
 *
 * ```
 *
 *
 * What is this doing?
 * Basically, when it runs, it will position fix the "root" element and then offset it by
 * the amount of scroll.
 */
export class ScrollSmoother {
    private settings: ScrollSmootherConfig;
    private domWatcher: DomWatcher;
    private raf: Raf;
    private rootElement: HTMLElement;
    // The current lerped y position.
    private currentY: number = 0;
    // The target y position.
    private targetY: number = 0;

    constructor(config: ScrollSmootherConfig) {
        this.settings = config;

        this.domWatcher = new DomWatcher();

        this.domWatcher.add({
            element: window,
            on: 'smartResize',
            callback: this.resize.bind(this),
        });

        this.domWatcher.add({
            element: window,
            on: 'scroll',
            eventOptions: { passive: true },
            callback: this.onWindowScroll.bind(this),
        });


        this.onWindowScroll();
        this.onSmartResize();
        this.updateScrollPosition(1,1);
        this.raf = new Raf(this.onRaf.bind(this));
        this.raf.start();
        requestAnimationFrame(()=> {
            this.onSmartResize();
        })
    }


    public resize() {
        this.onSmartResize();
    }


    private onSmartResize() {
        this.rootElement = this.settings.root;
        // document.body.style.height = 'auto';
        const height = this.rootElement.offsetHeight;

        requestAnimationFrame(() => {
            document.body.style.height = height + 'px';
            this.rootElement.style.position = 'fixed';
            this.rootElement.style.width = '100%';
        })
    }


    private onRaf() {
        // Cull unncessary updated based on a precision.
        // Use precision 0, since we don't need subpixels.
        this.updateScrollPosition(this.settings.lerp || 1, this.settings.damp || 1)
    }


    private onWindowScroll() {
        this.targetY = window.scrollY;
    }


    private updateScrollPosition(lerp:number = 1, damp:number = 1) {
        const precision = 0;
        const prev = this.currentY;
        let updated = mathf.damp(this.currentY, this.targetY, lerp, damp);
        updated = mathf.floorToPrecision(updated, precision);
        this.currentY = updated;
        if (prev == updated) {
            return;
        }

        if (this.settings.topMode) {
            this.rootElement.style.top = `-${this.currentY}px`;
        } else {
            this.rootElement.style.transform = `translateY(-${this.currentY}px)`;
        }

        if (this.settings.onUpdate) {
            this.settings.onUpdate(this.currentY, this.targetY);
        }

    }


    public dispose(): void {
        this.domWatcher && this.domWatcher.dispose();
        this.raf && this.raf.dispose();
        document.body.style.height = '';
        this.rootElement.style.position = '';
        this.rootElement.style.width = '';
    }

}
