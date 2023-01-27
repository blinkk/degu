
import {RafProgress} from '../lib/raf/raf-progress';
import {DomWatcher} from '../lib/dom/dom-watcher';
import {VectorDom} from '../lib/dom/vector-dom';
import * as EASE from '../lib/ease/ease';
import * as dom from '../lib/dom/dom';

export default class ScrollDemoSample3 {
  constructor() {
    console.log('Scroll Demo 3');

    this.domWatcher = new DomWatcher();
    this.parentElement = document.getElementById('parent');
    this.moduleHeight = this.parentElement.offsetHeight;
    this.childElement = document.getElementById('child');

    // Instance of rafProgress.
    const rafProgress = new RafProgress();

    // Update the progress value per scroll.
    this.domWatcher.add({
      element: window,
      on: 'scroll',
      callback: (event) => {
        this.progress =
                    dom.getElementScrolledPercent(this.parentElement, window.innerHeight);
        rafProgress.easeTo(this.progress, 0.08, EASE.linear);
      },
      eventOptions: {passive: true},
    });


    this.flowerElement = document.getElementById('flower');
    this.flowerVector = new VectorDom(this.flowerElement);
    this.flowerVector.anchorX = 0.5;
    this.flowerVector.anchorY = 0.5;

    let timeline = [
      {progress: 0, x: 1200, y: 600, z: 2 - 1, rx: 180, ry: 0, rz: 0, alpha: 0},
      {progress: 0.3, x: 100, y: 400, z: 2 - 1, rz: 180, alpha: 1},
      {progress: 0.6, x: 0, y: 200, z: 1 - 1, ry: 180, rz: 0},
      {progress: 0.8, x: 300, y: 800, z: 0.3 - 1, rx: 20, ry: 20, rz: 90, easingFunction: EASE.easeInOutCubic},
      {progress: 1, x: 400, y: 500, z: 5 - 1, rx: 0, ry: 0, rz: 0},
    ];

    this.flowerVector._.timeline.setTimeline(timeline);
    // Enable smoothing.
    this.flowerVector._.timeline.catmullRomMode = true;

    // Enable this to force the flowerVectorDom to use the
    // internal eularRotation as the rotation matrix.  You will
    // see gimble lock.
    // this.flowerVector.eularRotationAsRotationMatrix = true;

    this.flowerVector.init();


    this.cityElement = document.getElementById('city');
    this.cityVector = new VectorDom(this.cityElement);
    this.cityVector.anchorX = 0;
    this.cityVector.anchorY = 0;

    timeline = [
      {progress: 0, x: 0, y: 0, rx: 0, rz: 0, z: 0.5 - 1, alpha: 1, easingFunction: EASE.easeInOutQuint},
      {progress: 0.2, x: 1000, y: 400, rx: 0, rz: 360, z: 0 - 1, alpha: 0, easingFunction: EASE.easeInOutQuint},
    ];
    this.cityVector._.timeline.setTimeline(timeline);
    this.cityVector.init();


    // Create a second VectorDom on the parent element.
    this.parentElement = document.getElementById('parent');
    this.parentVector = new VectorDom(this.parentElement, {timeline: {cssOnly: true}});
    this.parentVector._.timeline.setTimeline([
      {
        'progress': 0,
        '--background': 'rgba(255, 129, 0, 1)',
        '--text-color': '#000000',
      },
      {
        'progress': 0.5,
        '--background': 'rgba(255, 153, 204, 1)',
        '--text-color': '#A56023',
      },
      {
        'progress': 1,
        // You can interchange between hex and rgba
        // since it all converts to rgba.
        '--background': '#000000',
        '--text-color': '#FFFFFF',
      },
    ]);
    this.parentVector.init();


    this.textElement = document.getElementById('text');
    this.textVector = new VectorDom(this.textElement);
    this.textVector.disableStyleRenders = true;
    // // // Just doing this via straight css var to demo.
    // // // You can normally just use the y value.
    this.textVector._.timeline.setTimeline([
      {
        'progress': 0.25,
        '--opacity': 0,
        '--y': '100px',
      },
      {
        'progress': 0.3,
        '--opacity': 1,
        '--y': '0px',
      },
      {
        'progress': 0.95,
        '--opacity': 1,
        '--y': '0px',
      },
      {
        'progress': 0.98,
        '--opacity': 0,
        '--y': '-100px',
      },
    ]);
    this.textVector.init();


    // Update progress immediately on load.
    this.progress =
            dom.getElementScrolledPercent(this.parentElement, window.innerHeight);
    this.render(this.progress);
    rafProgress.setCurrentProgress(this.progress);
    rafProgress.watch(this.onProgressUpdate.bind(this));
  }

  render(easedProgress) {
    this.parentVector._.timeline.updateProgress(easedProgress);
    this.parentVector.render(true);

    this.textVector._.timeline.updateProgress(easedProgress);
    this.textVector.render(true);

    this.flowerVector._.timeline.updateProgress(easedProgress);
    this.flowerVector.render(true);

    this.cityVector._.timeline.updateProgress(easedProgress);
    this.cityVector.render(true);
  }


  // Runs every time eased progress is updated.
  onProgressUpdate(easedProgress, direction) {
    this.render(easedProgress);
  }
}
