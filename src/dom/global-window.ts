import { DomWatcher } from './dom-watcher';

class GlobalWindow {

    private watcher: DomWatcher;

    /**
     * The global scrollY position.
     */
    public scrollY: number;

    constructor() {
        this.watcher = new DomWatcher();
        this.scrollY = window.scrollY;
        this.watcher.add({
            element: window,
            on: 'scroll',
            callback: this.onScroll.bind(this),
            eventOptions: { passive: true }
        })

    }

    private onScroll() {
        this.scrollY = window.scrollY;
    }

    dispose() {
        this.watcher.dispose();
    }
}

let globalWindow = new GlobalWindow();

// Not really a fan of this pattern but to support
// some cases where global-window is executed
// on different scopes at different times we
// preserve it in a global window object to
// guarantee it's a singleton instance.
if (window['YANO_JS_GLOBAL_WINDOW']) {
    globalWindow = window['YANO_JS_GLOBAL_WINDOW'];
} else {
    window['YANO_JS_GLOBAL_WINDOW'] = globalWindow;
}

export default globalWindow;