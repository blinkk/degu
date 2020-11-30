

import {RafProgress, RAF_PROGRESS_EVENTS} from '../lib/raf/raf-progress';
import {WebGlImageSequence} from '../lib/dom/webgl-image-sequence';

import {EASE} from '../lib/ease/ease';
import {dom} from '../lib/dom/dom';
import {DomWatcher} from '../lib/dom/dom-watcher';


/**
 * This sample demonstrates CanvasImageSequence sizing with cover
 */
export default class CanvasImageSequenceSample7 {
  constructor() {
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
        this.rafProgress.easeTo(this.progress, 0.25, EASE.Linear);
      },
      eventOptions: {passive: true},
    });

    // Update progress immediately on load.
    this.progress =
            dom.getElementScrolledPercent(this.parentElement);
    this.rafProgress.easeTo(this.progress, 1, EASE.Linear);
    this.rafProgress.watch(this.onProgressUpdate.bind(this));


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
        [{images: this.sources}],
        {
          cover: true,
          // bottom: 0,
          // left: 0
        }
    );


    // Load the images
    this.sequence.load().then(() => {
      // When ready render whatever the current easedProgress value is.
      this.sequence.renderByProgress(
          this.rafProgress.currentProgress
      );
    });
  }

  onProgressUpdate(easedProgress, direction) {
    this.sequence.renderByProgress(easedProgress);
  }
}
