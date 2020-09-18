
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
export class ScrollRenderFix {
    private raf: Raf;
    private currentY: number;
    private targetY: number;
    private domWatcher: DomWatcher;

    constructor() {
        this.raf = new Raf();
        this.domWatcher = new DomWatcher();
        this.domWatcher.add({
            element: window,
            on: 'wheel',
            eventOptions: { passive: false },
            callback: this.wheelHandler.bind(this)
        });
    }

    private wheelHandler(e:WheelEvent) {
        e.preventDefault();
        this.raf.read(()=> {
          this.targetY = document.documentElement.scrollTop + e.deltaY;
        });
        this.raf.postWrite(()=> {
            if (this.currentY !== this.targetY) {
              document.documentElement.scrollTop = this.targetY;
            }
        });
    }


    public dispose() {
      this.domWatcher && this.domWatcher.dispose();
    }
}