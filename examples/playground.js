
import { time } from '../lib/time/time';
export default class Playgroundsmaple {
    constructor() {
        console.log("play ground");

        // this.testDebouncer();
        this.testThrottler();

    }


    testDebouncer() {
        let debouncer = time.debounce((event) => {
            console.log('debounced', event);
        }, 1000);
        window.addEventListener('resize', debouncer);
    }

    testThrottler() {
        let throttler = time.throttle((event) => {
            console.log('throttled', event);
        }, 1000);
        window.addEventListener('resize', (event) => {
            console.log('resize called');
            throttler(event);
        });
    }

}