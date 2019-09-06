

import {Raf} from '../lib/raf/raf';
import {elementVisibility} from '../lib/dom/element-visibility';

/**
 * This is a sample of running raf with conditional.
 */
class RafSample2 {
  constructor() {
    console.log('running raf sample2');

    // Create one raf loop that run the screen size is less than 1000px
    this.mobileRaf = new Raf(() => {
      console.log('running mobile raf');
    });
    this.mobileRaf.runWhen(() => {
      return window.innerWidth < 1000;
    });
    this.mobileRaf.start();


    // Runs when the titleElement is in view.
    let ev = elementVisibility.inview(document.getElementById('title'));

    ev.readyPromise.then(() => {
      console.log('ev is ready');
    });
    this.titleRaf = new Raf(() => {
      console.log('element is in view.');
    });

    this.titleRaf.runWhen(() => {
      return ev.state().inview;
    });
    this.titleRaf.start();
  }
}
export default RafSample2;
