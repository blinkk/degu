

import {WebGlImageSequence} from '../lib/dom/webgl-image-sequence';


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
    this.sequence = new WebGlImageSequence(
        this.canvasContainerElement,
        [{images: this.canvasImageSources}]
    );

    this.sequence.lerpAmount = 0.01;
    this.sequence.load().then(() => {
      this.sequence.renderByProgress(0);

      // Immediately set to 1.  Because we previously set it to 0 and
      // no 1 and we have lerp set, canvasImageSequence will lerp
      // towards that value.
      this.sequence.renderByProgress(1);
    });
  }
}
