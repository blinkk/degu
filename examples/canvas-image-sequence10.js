
import {RafProgress, RAF_PROGRESS_EVENTS} from '../lib/raf/raf-progress';
import {CanvasImageSequence} from '../lib/dom/canvas-image-sequence';

import * as EASE from '../lib/ease/ease';
import * as dom from '../lib/dom/dom';
import {DomWatcher} from '../lib/dom/dom-watcher';
import {Vector} from '../lib/mathf/vector';


/**
 * This sample show loading multiple image sets
 */
export default class CanvasImageSequenceSample10 {
  constructor() {
    console.log('canvas image sequence 10');
    this.domWatcher = new DomWatcher();

    this.canvasContainerElement = document.querySelector('.canvas-container');
    this.parentElement = document.getElementById('parent');


    // Instance of rafProgress.
    this.rafProgress = new RafProgress();

    // Update the progress value per scroll.
    this.domWatcher.add({
      element: window,
      on: 'scroll',
      callback: (event) => {
        this.progress =
                    dom.getElementScrolledPercent(this.parentElement);
        this.rafProgress.easeTo(this.progress, 0.25, EASE.linear);
      },
      eventOptions: {passive: true},
    });

    // Update progress immediately on load.
    this.progress =
            dom.getElementScrolledPercent(this.parentElement);
    this.rafProgress.easeTo(this.progress, 1, EASE.linear);
    this.rafProgress.watch(this.onProgressUpdate.bind(this));


    // Generate image sources.
    this.canvasImageSources = [];
    for (let i = 1; i <= 153; i++) {
      let value = i + '';
      value = value.padStart(4, '0');
      this.canvasImageSources.push('./public/frames/thumb' + value + '.jpg');
    }

    // Generate a second "mobile" image sources.
    this.mobileImageSources = [];
    for (let i = 1; i <= 120; i++) {
      let value = i + '';
      value = value.padStart(4, '0');
      this.mobileImageSources.push('./public/frames2/thumb' + value + '.jpg');
    }

    // Create Canvas Image Sequenece
    this.canvasImageSequence = new CanvasImageSequence(
        this.canvasContainerElement,
        [
          {images: this.canvasImageSources, when: () => {
            return window.innerWidth >= 768;
          }},
          {images: this.mobileImageSources, when: () => {
            return window.innerWidth < 768;
          }},
        ]
    );


    // this.canvasImageSequence.lerpAmount = 0.02;

    // Load the iamges.
    this.canvasImageSequence.load().then(() => {
      // When ready render whatever the current easedProgress value is.
      this.canvasImageSequence.renderByProgress(
          this.rafProgress.currentProgress
      );
    });
  }

  onProgressUpdate(easedProgress, direction) {
    this.canvasImageSequence.renderByProgress(easedProgress);


    // On each update event, we are going to acquire the pixel
    // colors at coordinate x,y.
    const hexColor = this.canvasImageSequence.getHexColorAtPoint(new Vector(
        500, 500));
    console.log(hexColor);

    // Now we set the background to that color.
    this.parentElement.style.backgroundColor = hexColor;
  }
}
