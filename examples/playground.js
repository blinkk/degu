
import { time } from '../lib/time/time';
export default class Playgroundsmaple {
    constructor() {
        console.log("play ground");

        // this.testTimeDebouncer();
        // this.testTimeThrottler();

        // this.testTimeWaitUntil();
        this.testTimeWait();

    }


    testTimeDebouncer() {
        let debouncer = time.debounce((event) => {
            console.log('debounced', event);
        }, 1000);
        window.addEventListener('resize', debouncer);
    }

    testTimeThrottler() {
        let throttler = time.throttle((event) => {
            console.log('throttled', event);
        }, 1000);
        window.addEventListener('resize', (event) => {
            console.log('resize called');
            throttler(event);
        });
    }


    testTimeWaitUntil() {
        let someValue = 0;
        time.waitUntil(() => someValue == 5).then(() => {
            console.log('some value is 5!!!');
        });

        setTimeout(() => {
            someValue = 5;
        }, 1000);
    }

    testTimeWait() {
        console.log('hohoho');
        time.wait(500).then(() => {
            console.log('hohoho after 500ms');
        });
    }
}