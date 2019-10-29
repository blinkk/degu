

import {RafProgress} from '../lib/raf/raf-progress';
import {WebGlImageSequence} from '../lib/dom/webgl-image-sequence';

import {EASE} from '../lib/ease/ease';
import {dom} from '../lib/dom/dom';
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
      this.sources.push('/public/frames/thumb' + value + '.jpg');
    }

    // Create Canvas Image Sequenece
    this.sequence = new WebGlImageSequence(
        this.canvasContainerElement,
        [{images: this.sources}]
    );


    // We set the lerp value.
    this.sequence.lerpAmount = 0.01;

    // Load the iamges.
    this.sequence.load().then(() => {
      // On load, play the sequence from 0 - 1.
      this.sequence.play(0, 1, 1000).then(() => {
        console.log('done', this.rafProgress.currentProgress);
        // Update the progress to the current scroll when done.
        //
        // At this time, the playing ends at 1 but the scroll progress
        // could be something else so it will lerp "towards" the
        // scroll position since we have lerp set.
        this.sequence.renderByProgress(
            this.rafProgress.currentProgress
        );
      });
    });
  }

  onProgressUpdate(easedProgress, direction) {
    this.sequence.renderByProgress(easedProgress);
  }
}
