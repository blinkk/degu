
import { RafProgress, RAF_PROGRESS_EVENTS } from '../lib/raf/raf-progress';
import { DomWatcher } from '../lib/dom/dom-watcher';
import { VectorDom } from '../lib/dom/vector-dom';
import { EASE } from '../lib/ease/ease';
import { dom } from '../lib/dom/dom';
import { mathf } from '../lib/mathf/mathf';
import { CatmullRom } from '../lib/mathf/catmull-rom';
import { Vector } from '../lib/mathf/vector';

export default class ScrollDemoSample {
    constructor() {
        console.log('hello');

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

        // Update progress immediately on load.
        this.progress =
            dom.getElementScrolledPercent(this.parentElement);
        rafProgress.easeTo(this.progress, 1, EASE.Linear);

        rafProgress.watch(this.onProgressUpdate.bind(this));
    }


    // Runs every time eased progress is updated.
    onProgressUpdate(easedProgress, direction) {
        let sin = Math.sin(easedProgress);


        // Add some rotation
        this.flowerVector.rz += sin * 0.01;


        // Add some movement.
        let x = (window.innerWidth - this.flowerVector.width) * easedProgress;
        let y = (window.innerHeight - this.flowerVector.height) * easedProgress;

        // Since we need to offset.
        let z = (1 * easedProgress) - 0.5;

        this.flowerVector.x = x;
        this.flowerVector.y = y;
        this.flowerVector.z = z;

        this.flowerVector.render();
    }

}