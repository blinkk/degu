
import { DomWatcher } from '../lib/dom/dom-watcher';
import { func } from '../lib/func/func';

export default class DomWatcherSample {
    constructor() {
        console.log("this is working");


        const watcher = new DomWatcher();

        watcher.add({
            element: window,
            on: 'scroll',
            callback: (event) => {
                console.log('i am scrolling', event);
            },
            eventOptions: { passive: true },
            id: 'scrollWatch'
        });

        watcher.add({
            element: window,
            on: 'smartResize',
            callback: (event) => {
                console.log('I am smart resizing');
            },
            eventOptions: { passive: true },
        });


        // Add a watcher to button1 to remove the scroll watching.
        watcher.add({
            element: document.getElementById('button1'),
            on: 'click',
            callback: () => {
                console.log('you clicked button 1');
                watcher.removeById('scrollWatch');
            },
        });

        // Add a watcher to button2 that only works when viewport is
        // small
        watcher.add({
            element: document.getElementById('button2'),
            on: 'click',
            callback: () => {
                console.log('you clicked button 2');
            },
            runWhen: () => {
                return window.innerWidth <= 800;
            }
        });


        // A mouse move watcher.
        watcher.add({
            element: document.body,
            on: 'mousemove',
            callback: func.debounce((event) => {
                console.log('movemove!!');
            }, 500),
        });



        watcher.add({
            element: document.getElementById('button3'),
            on: 'click',
            callback: () => {
                watcher.removeAll();
            }
        });
    }
}