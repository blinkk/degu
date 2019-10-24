

import {CanvasImageSequence} from '../lib/dom/canvas-image-sequence';

const NO_CACHE = ()=> {
  let param = window.location.search.split('no-cache=')[1];
  param = param && param.split('&')[0];
  return param == 'true';
};


/**
 * CanvasImageSequence play feature.
 */
export default class CanvasImageSequenceSample5 {
  constructor() {
    console.log('canvasImageSequence5');

    this.canvasContainerElement = document.querySelector('.canvas-container');
    this.parentElement = document.getElementById('parent');


    // Generate image sources.
    this.canvasImageSources = [];
    for (let i = 1; i <= 153; i++) {
      let value = i + '';
      value = value.padStart(4, '0');
      this.canvasImageSources.push('/public/frames/thumb' + value + '.jpg');
    }

    // Create Canvas Image Sequenece
    this.canvasImageSequence = new CanvasImageSequence(
        this.canvasContainerElement,
        [{images: this.canvasImageSources}]
    );

    if (NO_CACHE()){
      console.log('no cache version');
      this.canvasImageSequence.storeInMemory(false);
    }

    this.canvasImageSequence.lerpAmount = 0.01;
    this.canvasImageSequence.load().then(() => {
      this.canvasImageSequence.renderByProgress(0);

      // Immediately set to 1.  Because we previously set it to 0 and
      // no 1 and we have lerp set, canvasImageSequence will lerp
      // towards that value.
      this.canvasImageSequence.renderByProgress(1);
    });
  }
}
