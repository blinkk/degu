
import { WebWorker } from '../lib/dom/web-worker';
import { func } from '../lib/func/func';
export default class Playgroundsmaple {
    constructor() {
        console.log("play ground");


        // TIME Stuff
        this.testFuncDebouncer();
        // this.testFuncThrottler();
        // this.testFuncWaitUntil();
        // this.testFuncWait();


        // DOM Stuff
        // this.testWebWorker();

    }


    testFuncDebouncer() {
        let debouncer = func.debounce((event) => {
            console.log('debounced', event);
        }, 1000);
        window.addEventListener('resize', debouncer);
    }

    testFuncThrottler() {
        let throttler = func.throttle((event) => {
            console.log('throttled', event);
        }, 1000);
        window.addEventListener('resize', (event) => {
            console.log('resize called');
            throttler(event);
        });
    }


    testFuncWaitUntil() {
        let someValue = 0;
        func.waitUntil(() => someValue == 5).then(() => {
            console.log('some value is 5!!!');
        });

        setTimeout(() => {
            someValue = 5;
        }, 1000);
    }

    testFuncWait() {
        console.log('hohoho');
        func.wait(500).then(() => {
            console.log('hohoho after 500ms');
        });
    }


    testWebWorker() {
        var worker = new WebWorker((params) => {
            return params.a + params.b;
        });

        let params = {
            a: 4,
            b: 3
        };

        worker.run(params).then((result) => {
            console.log('result', result);
        });
        worker.run({ a: 4, b: 6 }).then((result) => {
            console.log('result2', result);
        });
    }
}