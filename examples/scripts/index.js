import '../styles/index.sass';

// Examples.

import EaserDisableRafSample from '../easer-disable-raf';
import EaserSample from '../easer';

import InterpolateSample from '../interpolate';
import MultiInterpolateSample from '../multi-interpolate';
import CssVarInterpolateSample from '../css-var-interpolate';
import DomWatcherSample from '../dom-watcher';

import MathfEaseSample from '../mathf-ease';
import RafSample from '../raf';
import RafTimerSample from '../raf-timer';
import RafProgressSample from '../raf-progress';

import PlaygroundSample from '../playground';
import OffScreenCanvasSample from '../off-screen-canvas';

import CatmullRomSample from '../catmull-rom';
import HermiteCurveSample from '../hermite-curve';
import BezierCurveSample from '../bezier-curve';
import MatrixIVSample from '../matrixIV';
import MatrixIVSample2 from '../matrixIV2';
import MatrixIVSample3 from '../matrixIV3';
import Pseudo3dCanvasSample from '../pseudo-3d-canvas';
import RayCastingSample from '../raycasting';
import RayCasting2Sample from '../raycasting2';
import PerlinNoiseSample from '../perlin-noise';

// import VideoProgressSample from '../playground/video-progress';

import XSample from '../x';
import X2Sample from '../x2';

const samples = {
  'easerDisableRafSample': EaserDisableRafSample,
  'easerSample': EaserSample,
  'interpolateSample': InterpolateSample,
  'mathfEaseSample': MathfEaseSample,
  'multiInterpolateSample': MultiInterpolateSample,
  'cssVarInterpolateSample': CssVarInterpolateSample,
  'rafSample': RafSample,
  'rafTimerSample': RafTimerSample,
  'rafProgressSample': RafProgressSample,
  'playgroundSample': PlaygroundSample,
  'offScreenCanvasSample': OffScreenCanvasSample,
  'catmullRomSample': CatmullRomSample,
  'hermitCurveSample': HermiteCurveSample,
  'bezierCurveSample': BezierCurveSample,
  // 'videoProgressSample': VideoProgressSample,
  'matrixIVSample': MatrixIVSample,
  'matrixIVSample2': MatrixIVSample2,
  'matrixIVSample3': MatrixIVSample3,
  'pseudo3dCanvasSample': Pseudo3dCanvasSample,
  'rayCastingSample': RayCastingSample,
  'rayCasting2Sample': RayCasting2Sample,
  'xSample': XSample,
  'x2Sample': X2Sample,
  'domWatcherSample': DomWatcherSample,
  'perlinNoiseSample': PerlinNoiseSample
};

class Main {
  constructor() {
    this.createClassInstanceFromAttribute_();
  }

  createClassInstanceFromAttribute_() {
    // Do a look up of the 'int-sample' data attribute and then
    // attempt to run an instance of a class with that data attribute name.
    let element = document.querySelector('[init-sample]');
    if (!element) {
      return;
    }
    let className = element.getAttribute('init-sample');
    if (samples[className]) {
      console.log('Instantiating', className);
      new samples[className]();
    }

  }

}


new Main();
