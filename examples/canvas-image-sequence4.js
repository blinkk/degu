

import {RafProgress} from '../lib/raf/raf-progress';
import {CanvasImageSequence} from '../lib/dom/canvas-image-sequence';

import * as EASE from '../lib/ease/ease';
import * as dom from '../lib/dom/dom';
import {DomWatcher} from '../lib/dom/dom-watcher';


/**
 * This sample expands on canvas image sequence sample 1 and demonstrates
 * usage of multiinterpolate.
 */
export default class CanvasImageSequenceSample3 {
  constructor() {
    console.log('canvas image sequence4');
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

    // Create Canvas Image Sequenece
    this.canvasImageSequence = new CanvasImageSequence(
        this.canvasContainerElement,
        [{images: this.canvasImageSources}]
    );

    // We set the lerp value.
    this.canvasImageSequence.lerpAmount = 0.01;

    // Load the iamges.
    this.canvasImageSequence.load().then(() => {
      // On load, play the sequence from 0 - 1.
      this.canvasImageSequence.play(0, 1, 1000).then(() => {
        console.log('done', this.rafProgress.currentProgress);
        // Update the progress to the current scroll when done.
        //
        // At this time, the playing ends at 1 but the scroll progress
        // could be something else so it will lerp "towards" the
        // scroll position since we have lerp set.
        this.canvasImageSequence.renderByProgress(
            this.rafProgress.currentProgress
        );
      });
    });
  }

  onProgressUpdate(easedProgress, direction) {
    this.canvasImageSequence.renderByProgress(easedProgress);
  }
}
