

import {RafProgress, RAF_PROGRESS_EVENTS} from '../lib/raf/raf-progress';
import {CanvasImageSequence} from '../lib/dom/canvas-image-sequence';

import {EASE} from '../lib/ease/ease';
import {dom} from '../lib/dom/dom';
import {DomWatcher} from '../lib/dom/dom-watcher';


/**
 * This sample demonstrates CanvasImageSequence with clippings.
 */
export default class CanvasImageSequenceSample8 {
  constructor() {
    console.log('canvas image sequence sample 8');
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
    this.canvasImageSources = [];
    for (let i = 1; i <= 153; i++) {
      let value = i + '';
      value = value.padStart(4, '0');
      this.canvasImageSources.push('/public/frames/thumb' + value + '.jpg');
    }

    // Create Canvas Image Sequenece
    this.canvasImageSequence = new CanvasImageSequence(
        this.canvasContainerElement,
        [{images: this.canvasImageSources}],
        {
          cover: true,
        }
    );

    // Apply clipping.
    this.canvasImageSequence.setClipInterpolations({
      type: 'inset',
      interpolations: [
        {
          progress: [{from: 0, to: 1, start: 0.5, end: 0}],
          id: 'top',
        },
        {
          progress: [{from: 0, to: 1, start: 0.5, end: 0}],
          id: 'right',
        },
        {
          progress: [{from: 0, to: 1, start: 0.5, end: 0}],
          id: 'bottom',
        },
        {
          progress: [{from: 0, to: 1, start: 0.5, end: 0}],
          id: 'left',
        },
        {
          progress: [
            {from: 0, to: 0.8, start: 0, end: 60},
            {from: 0.8, to: 1, start: 60, end: 0},
          ],
          id: 'border-radius',
        },
      ],
    });


    // Load the images
    this.canvasImageSequence.load().then(() => {
      // When ready render whatever the current easedProgress value is.
      this.canvasImageSequence.renderByProgress(
          this.rafProgress.currentProgress
      );
    });
  }

  onProgressUpdate(easedProgress, direction) {
    this.canvasImageSequence.renderByProgress(easedProgress);
  }
}
