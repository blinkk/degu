
import { mathf } from '../lib/mathf/mathf';
import { RafProgress, RAF_PROGRESS_EVENTS } from '../lib/raf/raf-progress';
import { EASE } from '../lib/ease/ease';

export default class RafProgressSample {
    constructor() {
        console.log('RafProgressSample');

        this.body = document.getElementById('body');
        this.range = document.getElementById('range');
        this.progressElement = document.getElementById('progress');


        const rafProgress = new RafProgress();
        rafProgress.watch((easedProgress, direction) => {
            // console.log('progress event', easedProgress);
            this.progressElement.textContent = easedProgress;
        });


        // Watch from 0.5 to 0.6.
        const rangeWatcher = (currentProgress, direction) => {
            console.log('range watcher', currentProgress, direction);
        };
        rafProgress.watchFor([0.5, 0.6], rangeWatcher);
        // rafProgress.unwatchFor(rangeWatcher);


        const rangeWatcher2 = (currentProgress, direction) => {
            console.log('around 20%!', currentProgress, direction);
        };
        rafProgress.watchFor(0.2, rangeWatcher2);



        rafProgress.watchFor(0, () => {
            this.addClass('blue');
        });

        rafProgress.watchFor([0.5, 0.6], () => {
            console.log('red');
            this.addClass('red');
        });
        rafProgress.watchFor(0.7, () => {
            console.log('yellow');
            this.addClass('yellow');
        });

        rafProgress.watchFor(1, () => {
            this.addClass('green');
        });

        rafProgress.setPrecision(5);
        rafProgress.setCurrentProgress(this.range.value);

        // Update rafProgress each time the value of range changes.
        this.range.addEventListener('input', () => {
            rafProgress.easeTo(+this.range.value, 0.25, EASE.easeInOutQuad);
        });
    }

    addClass(color) {
        const previousColor = this.currentColor;
        this.currentColor = color;

        if (previousColor) {
            this.body.classList.remove(previousColor);
        }
        this.body.classList.add(color);

    }



}