import {LazyVideo} from '../lib/dom/lazy-video.js';

export default class LazyVideoSample {
    constructor() {
      const lazyVideoElements =
            Array.from(document.querySelectorAll('[lazy-video]'));
      lazyVideoElements.forEach((element)=> {
        new LazyVideo(element)
      })
    }
}
