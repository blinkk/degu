
import * as dat from 'dat.gui';
import {Raf} from '../lib/raf/raf';
import {RafProgress} from '../lib/raf/raf-progress';
import {DomWatcher} from '../lib/dom/dom-watcher';
import {VectorDom} from '../lib/dom/vector-dom';
import * as EASE from '../lib/ease/ease';
import * as dom from '../lib/dom/dom';
import {CssVarInterpolate} from '../lib/interpolate/css-var-interpolate';

export default class ScrollDemoSample5 {
  constructor() {
    console.log('Sample 5');

    this.domWatcher = new DomWatcher();
    this.parentElement = document.getElementById('parent');
    this.moduleHeight = this.parentElement.offsetHeight;
    this.childElement = document.getElementById('child');

    // Instance of rafProgress.
    const rafProgress = new RafProgress();
    const raf = new Raf(this.raf.bind(this));

    // Update the progress value per scroll.
    this.domWatcher.add({
      element: window,
      on: 'scroll',
      callback: (event) => {
        this.progress =
                    dom.getElementScrolledPercent(this.parentElement);
        rafProgress.easeTo(this.progress, 0.08, EASE.linear);
      },
      eventOptions: {passive: true},
    });


    this.flowerElement = document.getElementById('flower');
    this.flowerVector = new VectorDom(this.flowerElement);
    this.flowerVector.anchorX = 0;
    this.flowerVector.anchorY = 0;

    const timeline = [
      {progress: 0, ry: 0, rz: 0, x: 0, y: 0, z: 0.5 - 1},
      {progress: 0.2, ry: -90, rz: 180, x: 200, y: 500, z: 0.2 - 1},
      {progress: 0.4, ry: 0, rz: -180, x: 400, y: 100, z: 0.5 - 1},
      {progress: 0.6, rz: 0, x: 600, y: 400, z: 1 - 1},
      {progress: 0.8, rz: 90, x: 800, y: 500, z: 0.3 - 1},
      {progress: 1, rz: 0, x: 1000, y: 200, z: 1 - 1},
    ];
    this.flowerVector._.timeline.setTimeline(timeline);

    this.flowerVector.init();

    // Use catmull rom mode to make this super smooth between points.
    this.flowerVector._.timeline.catmullRomMode = true;
    this.flowerVector._.timeline.catmullRomTension = 1;

    // Update progress immediately on load.
    this.progress =
            dom.getElementScrolledPercent(this.parentElement);
    rafProgress.easeTo(this.progress, 1, EASE.linear);

    rafProgress.watch(this.onProgressUpdate.bind(this));


    // Animate the background color of the body with css var interpolate.
    this.cssVarInterpolate = new CssVarInterpolate(
        document.body,
        {
          interpolations: [
            {
              progress: [
                {
                  from: 0, to: 0.5,
                  start: 'rgba(255, 128, 0, 0.3)', // orange
                  end: 'rgba(255, 153, 204, 1)', // pink
                },
                {
                  from: 0.5, to: 1,
                  start: 'rgba(255, 153, 204, 1)', // pink
                  end: 'rgba(0, 0, 255, 1)', // blue
                },
              ],
              id: '--background',
            },
          ],
        }
    );


    this.gui = new dat.GUI();
    let datFolder = this.gui.addFolder('Catmull Rom');
    datFolder.add(this.flowerVector._.timeline, 'catmullRomMode');
    datFolder.add(this.flowerVector._.timeline, 'catmullRomTension', -3, 3);

    raf.start();
  }


  // Runs every time eased progress is updated.
  onProgressUpdate(easedProgress, direction) {
    let sin = Math.sin(easedProgress);

    this.cssVarInterpolate.update(easedProgress);
    this.flowerVector._.timeline.updateProgress(easedProgress);
  }

  raf() {
    this.flowerVector.slerpEularRotation(0.1);
    this.flowerVector.render();
  }
}
