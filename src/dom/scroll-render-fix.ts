
import {Raf} from '../raf/raf';
import { DomWatcher } from './dom-watcher';

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
     * Callbacks run immediately before the document is manually scrolled.
     * Run during the RAF postWrite step.
     * @private
     */
    private readonly beforeScrollCallbacks: Array<() => void>;
    /**
     * Callbacks run immediately after the document is manually scrolled.
     * Run during the RAF postWrite step.
     * @private
     */
    private readonly afterScrollCallbacks: Array<() => void>;

    constructor(
        {
          beforeScrollCallbacks = [],
          afterScrollCallbacks = [],
        }: {
          beforeScrollCallbacks?: Array<() => void>,
          afterScrollCallbacks?: Array<() => void>,
        } = {}
    ) {
        this.raf = new Raf();
        this.beforeScrollCallbacks = beforeScrollCallbacks;
        this.afterScrollCallbacks = afterScrollCallbacks;
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
              this.beforeScrollCallbacks.forEach((cb) => cb());
              if (this.currentY !== this.targetY) {
                this.getScrollElement().scrollTop = this.targetY;
                this.currentY = this.targetY;
              }
              this.afterScrollCallbacks.forEach((cb) => cb());
          });
        });
    }


    public dispose() {
      this.domWatcher && this.domWatcher.dispose();
    }
}
