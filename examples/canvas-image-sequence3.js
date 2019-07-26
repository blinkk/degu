


import { RafProgress } from '../lib/raf/raf-progress';
import { CanvasImageSequence } from '../lib/dom/canvas-image-sequence';

import { EASE } from '../lib/ease/ease';
import { dom } from '../lib/dom/dom';
import { DomWatcher } from '../lib/dom/dom-watcher';


/**
 * This sample expands on canvas image sequence sample 1 and demonstrates
 * usage of multiinterpolate.
 */
export default class CanvasImageSequenceSample3 {
    constructor() {
        console.log('canvas image sequence3');
        this.domWatcher = new DomWatcher();

        this.canvasContainerElement = document.querySelector('.canvas-container');
        this.parentElement = document.getElementById("parent");

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
            eventOptions: { passive: true }
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
            value = value.padStart(4, "0");
            this.canvasImageSources.push('/public/frames/thumb' + value + '.jpg');
        }

        // Create Canvas Image Sequenece
        this.canvasImageSequence = new CanvasImageSequence(
            this.canvasContainerElement,
            this.canvasImageSources
        );

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

            // this.canvasImageSequence.renderByProgress(
            //     this.rafProgress.currentProgress
            // );
        });

    }

    onProgressUpdate(easedProgress, direction) {
        this.canvasImageSequence.renderByProgress(easedProgress);
    }
}