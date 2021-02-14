
import { ProgressWatcher } from '../dom/progress-watcher';

export interface InviewProgressItem {
    range: number | Array<number>;
    element: HTMLElement,
    className: string,
}

/**
 * A class that adds or removes css classes to a given element based on
 * progress values.
 *
 * const inviewProgress = new InviewProgress();
 *
 * // Adds the css class 'active' to the el element while progress is
 * // from 0.2 to 0.4.  If out of range, active gets removed.
 *  this.inviewProgress.add({
 *    range: [0.2, 0.4],
 *    element: el,
 *    className: "active"
 *  })
 *
 * inviewProgress.update(0.2)
 *
 *
 * // If using with css parallaxer, you might do something
 * // like this.
 *  onRaf() {
 *       this.inviewProgress.setProgress(
 *           this.cssParallaxer.getProgress()
 *       );
 &  }
 */
export class InviewProgress {
    private progressWatcher: ProgressWatcher;

    constructor() {
        this.progressWatcher = new ProgressWatcher();
    }


    add(inviewProgressItem: InviewProgressItem) {

        const setActive = () => {
            inviewProgressItem.element.classList.add(
                inviewProgressItem.className
            )
        }

        const setInactive = () => {
            inviewProgressItem.element.classList.remove(
                inviewProgressItem.className
            )
        }

        this.progressWatcher.add({
            range: inviewProgressItem.range,
            callback: (progress: number, direction: number) => {
                setActive();
            },
            inactiveCallback: (progress: number, direction: number) => {
                setInactive();
            }
        })

    }


    /**
     * Clears out the css class inviews.
     */
    public clear() {
        this.progressWatcher.clear();
    }


    /**
     * Sets the progress value.
     * @param progress
     */
    public setProgress(progress: number): void {
        this.progressWatcher.setProgress(progress);
    }


    /**
     * Gets the internal instance of progress Watcher.
     */
    public getProgressWatcher() {
        return this.progressWatcher;
    }

    public dispose() {
        this.progressWatcher.dispose();
    }
}