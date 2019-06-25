
import { RafProgress, RAF_PROGRESS_EVENTS } from '../lib/raf/raf-progress';
import { DomWatcher } from '../lib/dom/dom-watcher';
import { VectorDom } from '../lib/dom/vector-dom';
import { EASE } from '../lib/ease/ease';
import { dom } from '../lib/dom/dom';
import { mathf } from '../lib/mathf/mathf';
import { CatmullRom } from '../lib/mathf/catmull-rom';
import { Vector } from '../lib/mathf/vector';

export default class ScrollDemoSample3 {
    constructor() {
        console.log('Scroll Demo 3');

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
        this.flowerVector.anchorX = 0.5;
        this.flowerVector.anchorY = 0.5;


        const timeline = [
            { progress: 0, x: 100, y: 600, z: 1 - 1.3, rz: 0, alpha: 0 },
            { progress: 0.3, x: 100, y: 400, z: 1 - 0.9, rz: 180, alpha: 1 },
            { progress: 0.6, x: 400, y: 800, z: 1 - 0.7, rz: 10 },
            { progress: 0.8, x: 400, y: 800, z: 1 - 0.7, rz: 30, easingFunction: EASE.easeInOutCubic },
            { progress: 1, x: 400, y: 0, z: 1 - 0.3, rz: 0 },
        ];

        this.flowerVector.setTimeline(timeline);

        // Update progress immediately on load.
        this.progress =
            dom.getElementScrolledPercent(this.parentElement);
        rafProgress.easeTo(this.progress, 1, EASE.Linear);

        rafProgress.watch(this.onProgressUpdate.bind(this));
    }


    // Runs every time eased progress is updated.
    onProgressUpdate(easedProgress, direction) {

        this.flowerVector.setTimelineProgress(easedProgress);
        this.flowerVector.render();
    }

}