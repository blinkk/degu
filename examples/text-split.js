import { TextSplit } from '../lib/dom/text-split';

export default class TextSplitSample {
    constructor() {
        console.log('text split sample');

        // Split by word
        let splitter = new TextSplit({
            element: document.getElementById('split1'),
            split: ' ',
        });


        // Split by character
        let splitter2 = new TextSplit({
            element: document.getElementById('split2'),
            split: '',
        });

        // Run splitting every 2 seconds.
        // This layout thrashes so in practice, you wouldn't want to do this,
        // and instead reset a css class.
        window.setInterval(() => {
            splitter.split();
            splitter2.split();
        }, 2000);
    }
}