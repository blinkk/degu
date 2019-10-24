

import {CanvasImageSequence} from '../lib/dom/canvas-image-sequence';

const NO_CACHE = ()=> {
  let param = window.location.search.split('no-cache=')[1];
  param = param && param.split('&')[0];
  return param == 'true';
};


/**
 * CanvasImageSequence play feature.
 */
export default class CanvasImageSequenceSample3 {
  constructor() {
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

    let progressPoints = [
      {
        from: 0, to: 0.5, start: 0, end: 1,
      },
      {
        from: 0.5, to: 1, start: 1, end: 0,
      },
    ];
    this.canvasImageSequence.setMultiInterpolation(progressPoints);

    // Load the iamges.
    this.canvasImageSequence.load().then(() => {
      // On load, play the sequence from 0 - 1.
      this.canvasImageSequence.play(0, 1, 3000).then(() => {
        console.log('play complete');
      });
    });
  }
}
