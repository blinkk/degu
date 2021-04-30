
import {Raf} from '../raf/raf';
import { DomWatcher } from './dom-watcher';
import {noop} from '../func/noop';


export interface ScrollRenderFixConfig {
  /**
   * Callback run immediately before the document is manually scrolled.
   * Run during the RAF postWrite step.
   */
  beforeScrollCallback?: () => void;
  /**
   * Callback run immediately after the document is manually scrolled.
   * Run during the RAF postWrite step.
   */
  afterScrollCallback?: () => void;
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
 *
 * Thanks to Angus and Eric for this tip.
 *
 * Since this issue is chrome specific, you might want scope it to only chrome.
 * Usage:
 *
 * ```
 * if (is.chrome()) {
 *   new ScrollRenderFix();
 * }
 * ```
 *
 * To take full advantage, use toolbox mutate or degu.read / writes.
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
export class ScrollRenderFix {
    private raf: Raf;
    private currentY: number;
    private targetY: number;
    private domWatcher: DomWatcher;
    /**
     * Callback run immediately before the document is manually scrolled.
     * Run during the RAF postWrite step.
     * @private
     */
    private readonly beforeScrollCallback: () => void;
    /**
     * Callback run immediately after the document is manually scrolled.
     * Run during the RAF postWrite step.
     * @private
     */
    private readonly afterScrollCallback: () => void;

    constructor(config: ScrollRenderFixConfig = {}) {
        this.raf = new Raf();
        this.beforeScrollCallback = config.beforeScrollCallback || noop;
        this.afterScrollCallback = config.afterScrollCallback || noop;
        this.domWatcher = new DomWatcher();
        this.domWatcher.add({
            // @ts-ignore
            element: document,
            on: 'wheel',
            eventOptions: { passive: false, capture: true },
            callback: this.wheelHandler.bind(this)
        });
    }


    private getScrollElement():Element {
      return document.scrollingElement || document.documentElement;
    }

    private wheelHandler(e:WheelEvent) {
        e.preventDefault();
        this.raf.read(()=> {
          this.targetY = this.getScrollElement().scrollTop + e.deltaY;
          this.raf.postWrite(()=> {
              this.beforeScrollCallback();
              if (this.currentY !== this.targetY) {
                this.getScrollElement().scrollTop = this.targetY;
                this.currentY = this.targetY;
              }
              this.afterScrollCallback();
          });
        });
    }


    public dispose() {
      this.domWatcher && this.domWatcher.dispose();
      this.raf && this.raf.dispose();
    }
}
