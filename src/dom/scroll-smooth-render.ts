
import {Raf} from '../raf/raf';
import {mathf} from '../mathf/mathf';


export interface ScrollSmoothRenderConfig {
    // How much to move per mouse wheel.
    scrollSensitivity: number,
    lerp: number,
    damp: number
}

/**
 * What this class does is, it eats the window.wheel event
 * and eats the scroll.  It allows the rendering to catch up and then
 * once it is done,  it reapplies the scroll to the document.
 *
 * While this sounds counter-intuitive, it allows rendering to catchup
 * and can smooth animations.
 *
 * In short, if you have scroll tied animations or intense animations,
 * this can help fix the issue.
 *
 * Thanks to Angus and Eric for this tip.
 *
 *
 * This is different from scroll-render-fix in that it will allow you to
 * damp the scroll position to create a smoother experience.
 *
 * Since this issue is chrome specific, you might want scope it to only chrome.
 * Usage:
 *
 * ```
 *   new ScrollRenderSmooth({
 *      scrollSensitivity: 4,
 *      lerp: 1,
 *      damp: 0.4
 *  });
 * ```
 *
 * To take full advantage, use toolbox mutate or yano.read / writes.
 * ```
 *
 * const raf = new Raf();
 *
 * raf.read(()=> {
 *   // do some reading
 * })
 *
 * raf.writing(()=> {
 *   // do some writing
 * })
 *
 * ```
 *
 *
 *
 */
export class ScrollSmoothRender {
    private raf: Raf;
    private currentY: number;
    private targetY: number;
    private isScrolling: boolean = false;
    private isWheeling: boolean = false;
    private config : ScrollSmoothRenderConfig;

    constructor(config: ScrollSmoothRenderConfig) {
        this.raf = new Raf(this.onRaf.bind(this));
        this.raf.setReadWriteMode(true);
        this.config = config;
        window.addEventListener(
            'wheel', this.wheelHandler.bind(this), {
                 passive: false
            });
        window.addEventListener(
            'scroll', this.scrollHandler.bind(this), {
                 passive: true
            });

        this.raf.start();

    }

    private onRaf() {
        this.raf.postWrite(()=> {
            if (this.currentY !== this.targetY) {
              document.documentElement.scrollTop = this.targetY;
            }
        });
    }

    private scrollHandler() {
        console.log('isScrolling');
        this.raf.read(()=> {
            if(this.isWheeling) {
                return;
            }
            this.targetY = document.documentElement.scrollTop;
        })
    }


    private wheelHandler(e:WheelEvent) {
        e.preventDefault();
        this.isWheeling = false;
        this.raf.read(()=> {
          const top = document.documentElement.scrollTop;
          this.targetY = mathf.damp(top,
                top + e.deltaY * this.config.scrollSensitivity,
                this.config.lerp,
                this.config.damp);
        });
        this.raf.postWrite(()=> {
            this.isWheeling = false;
        });
    }
}