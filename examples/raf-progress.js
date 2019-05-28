
import { mathf } from '../lib/mathf/mathf';
import { RafProgress, RAF_PROGRESS_EVENTS } from '../lib/raf/raf-progress';
import { EASE } from '../lib/ease/ease';

export default class RafProgressSample {
    constructor() {
        console.log('RafProgressSample');

        this.ball = document.getElementById('ball');
        this.range = document.getElementById('range');


        const rafProgress = new RafProgress();
        rafProgress.watch((easedProgress, direction) => {
            // console.log('progress event', easedProgress);
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


        rafProgress.setPrecision(5);
        rafProgress.setCurrentProgress(this.range.value);

        // Update rafProgress each time the value of range changes.
        this.range.addEventListener('input', () => {
            rafProgress.easeTo(+this.range.value, 0.25, EASE.easeInOutQuad);
        });

    }

}