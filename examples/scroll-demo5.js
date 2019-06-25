
import { RafProgress, RAF_PROGRESS_EVENTS } from '../lib/raf/raf-progress';
import { DomWatcher } from '../lib/dom/dom-watcher';
import { VectorDom } from '../lib/dom/vector-dom';
import { EASE } from '../lib/ease/ease';
import { dom } from '../lib/dom/dom';
import { mathf } from '../lib/mathf/mathf';
import { CatmullRom } from '../lib/mathf/catmull-rom';
import { Vector } from '../lib/mathf/vector';

export default class ScrollDemoSample5 {
    constructor() {
        console.log('Sample 5');

        this.domWatcher = new DomWatcher();
        this.parentElement = document.getElementById("parent");
        this.moduleHeight = this.parentElement.offsetHeight;
        this.childElement = document.getElementById("child");

        // Instance of rafProgress.
        const rafProgress = new RafProgress();

        // Update the progress value per scroll.
        this.domWatcher.add({
            element: window,
            on: 'scroll',
            callback: (event) => {
                this.progress =
                    dom.getElementScrolledPercent(this.parentElement);
                rafProgress.easeTo(this.progress, 0.25, EASE.Linear);
            },
            eventOptions: { passive: true }
        });


        this.flowerElement = document.getElementById('flower');
        this.flowerVector = new VectorDom(this.flowerElement);
        this.flowerVector.anchorX = 0;
        this.flowerVector.anchorY = 0;

        const timeline = [
            { progress: 0, x: 0, y: 0, z: 0.5 - 1 },
            { progress: 0.2, x: 200, y: 500, z: 0.5 - 1 },
            { progress: 0.4, x: 400, y: 100, z: 0.5 - 1 },
            { progress: 0.6, x: 600, y: 400, z: 0.8 - 1 },
            { progress: 0.8, x: 800, y: 500, z: 0.3 - 1 },
            { progress: 1, x: 1000, y: 200, z: 1 - 1 },
        ];
        this.flowerVector.setTimeline(timeline);
        this.flowerVector.timelineCatmullRomMode = true;
        this.flowerVector.timelineCatmullRomTension = 1;

        // Update progress immediately on load.
        this.progress =
            dom.getElementScrolledPercent(this.parentElement);
        rafProgress.easeTo(this.progress, 1, EASE.Linear);

        rafProgress.watch(this.onProgressUpdate.bind(this));
    }


    // Runs every time eased progress is updated.
    onProgressUpdate(easedProgress, direction) {
        let sin = Math.sin(easedProgress);

        this.flowerVector.setTimelineProgress(easedProgress);
        this.flowerVector.render();
    }

}