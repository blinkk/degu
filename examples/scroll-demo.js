
import { RafProgress } from '../lib/raf/raf-progress';
import { DomWatcher } from '../lib/dom/dom-watcher';
import { VectorDom } from '../lib/dom/vector-dom';
import { EASE } from '../lib/ease/ease';
import { dom } from '../lib/dom/dom';
import { elementVisibility } from '../lib/dom/element-visibility';

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
        this.flowerVector.init();

        // Update progress immediately on load.
        this.progress =
            dom.getElementScrolledPercent(this.parentElement);
        rafProgress.easeTo(this.progress, 1, EASE.Linear);

        rafProgress.watch(this.onProgressUpdate.bind(this));


        // Element visibility.
        let observer = elementVisibility.inview(
            document.getElementById('footer-title'), {},
            (element, changes, dispose) => {
                if (changes.isIntersecting) {
                    console.log('inview');
                    element.classList.add('active');
                } else {
                    console.log('not inview');
                    element.classList.remove('active');
                }
            }
        );


        // Example of using DOMWatcher to do something when the footer title
        // is inview.
        let ev = elementVisibility.inview(
            document.getElementById('footer-title'), {});
        this.domWatcher.add({
            element: window,
            on: 'scroll',
            eventOptions: { passive: true },
            callback: () => {
                console.log('this should only run when the footer is inview');
            },
            runWhen: () => { return ev.state().inview; }
        });


        // Example of disposing the element visibility after
        // 10 seconds.
        // window.setTimeout(() => {
        //     console.log('dispoed');
        //     observer.dispose();
        // }, 10000);
    }


    // Runs every time eased progress is updated.
    onProgressUpdate(easedProgress, direction) {
        let sin = Math.sin(easedProgress);



        // Add some rotation per progress update.
        this.flowerVector.rz += 0.1;
        this.flowerVector.rotation.slerpEulerVector(this.flowerVector.eularRotation, 0.08);


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