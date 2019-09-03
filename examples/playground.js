
import { dom } from '../lib/dom/dom';
import { WebWorker } from '../lib/dom/web-worker';
import { func } from '../lib/func/func';
import { mathf } from '../lib/mathf/mathf';


export default class Playgroundsmaple {
    constructor() {
        console.log("play ground");


        // TIME Stuff
        // this.testFuncDebouncer();
        // this.testFuncThrottler();
        // this.testFuncWaitUntil();
        // this.testFuncWait();
        // this.testFuncMemoizeSimple();
        // this.testFuncMemoize();
        // this.testFuncRunOnceOnChange();
        this.testDomRunAfterNotTopOfScreen();

        // DOM Stuff
        // this.testWebWorker();
    }


    testDomRunAfterNotTopOfScreen() {
        dom.runAfterNotTopOfScreen(() => {
            console.log('running');
        });
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

    testFuncMemoizeSimple() {
        let showName = func.memoizeSimple(
            (name) => {
                return name;
            }
        );

        console.log(showName('John'));
        console.log(showName('John'));
        console.log(showName('John'));
        console.log(showName('John'));
        console.log(showName('Scott'));
    }

    testFuncRunOnceOnChange() {
        let expensiveOperation = func.runOnceOnChange(
            (name) => {
                console.log(name);
            }
        );

        expensiveOperation('Scott');
        expensiveOperation('Scott');
        expensiveOperation('Scott');
        expensiveOperation('Scott');
        expensiveOperation('Scott');
        expensiveOperation('John');
        expensiveOperation('John');
        expensiveOperation('Aya');
        expensiveOperation('Aya');
    }

    testFuncMemoize() {
        let calculate = func.memoize(
            (a, b) => {
                console.log('calculating');
                return a + b;
            }
        );

        console.log(calculate(3, 2));
        console.log(calculate(2, 2));
        console.log(calculate(3, 2));
        console.log(calculate(2, 2));
        console.log(calculate(3, 2));
    }


    testWebWorker() {
        var worker = new WebWorker((params) => {
            return params.a + params.b;
        });

        let params = {
            a: 4,
            b: 3
        };

        worker.runOneTimeThrowAwayWorker(params).then((result) => {
            console.log('one time worker');
        });

        worker.runOneTimeThrowAwayWorker(params).then((result) => {
            console.log('one time worker');
        });

        // Run once.  Run uses the same worker.
        worker.run(params).then((result) => {
            console.log('result', result);

            // Make another call.
            worker.run({ a: 4, b: 6 }).then((result) => {
                console.log('result2', result);
                worker.terminate();
            });

        });
    }


}