
import {Inview} from '../lib/dom/inview';


export default class InviewSample {
    constructor() {
        console.log("inview sample");

        new Inview({
            element: document.getElementById('test0'),
            elementBaseline: 0,
            viewportOffset: 0.2,
        });

        new Inview({
            element: document.getElementById('test'),
            elementBaseline: 0,
            viewportOffset: 0.2,
        });

        new Inview({
            element: document.getElementById('test2'),
            elementBaseline: 0,
            viewportOffset: 0.2,
        });
    }

}