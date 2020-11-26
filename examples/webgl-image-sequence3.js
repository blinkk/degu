

import {WebGlImageSequence} from '../lib/dom/webgl-image-sequence';


/**
 * CanvasImageSequence play feature.
 */
export default class CanvasImageSequenceSample3 {
  constructor() {
    this.canvasContainerElement = document.querySelector('.canvas-container');
    this.parentElement = document.getElementById('parent');


    // Generate image sources.
    this.sources = [];
    for (let i = 1; i <= 153; i++) {
      let value = i + '';
      value = value.padStart(4, '0');
      this.sources.push('./public/frames/thumb' + value + '.jpg');
    }

    // Create Canvas Image Sequenece
    this.sequence = new WebGlImageSequence(
        this.canvasContainerElement,
        [{images: this.sources}]
    );


    let progressPoints = [
      {
        from: 0, to: 0.5, start: 0, end: 1,
      },
      {
        from: 0.5, to: 1, start: 1, end: 0,
      },
    ];
    this.sequence.setMultiInterpolation(progressPoints);

    // Load the iamges.
    this.sequence.load().then(() => {
      // On load, play the sequence from 0 - 1.
      this.sequence.play(0, 1, 3000).then(() => {
        console.log('play complete');
      });
    });
  }
}
