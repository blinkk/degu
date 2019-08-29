import '../styles/index.sass';

// Examples.

import EaserDisableRafSample from '../easer-disable-raf';
import EaserSample from '../easer';

import InterpolateSample from '../interpolate';
import MultiInterpolateSample from '../multi-interpolate';
import CssVarInterpolateSample from '../css-var-interpolate';
import CssVarInterpolateSample2 from '../css-var-interpolate2';
import CssVarInterpolateSample3 from '../css-var-interpolate3';
import DomWatcherSample from '../dom-watcher';
import CanvasImageSequenceSample from '../canvas-image-sequence';
import CanvasImageSequenceSample2 from '../canvas-image-sequence2';
import CanvasImageSequenceSample3 from '../canvas-image-sequence3';
import CanvasImageSequenceSample4 from '../canvas-image-sequence4';
import CanvasImageSequenceSample5 from '../canvas-image-sequence5';
import CanvasImageSequenceSample6 from '../canvas-image-sequence6';
import CanvasImageSequenceSample7 from '../canvas-image-sequence7';
import CanvasImageSequenceSample8 from '../canvas-image-sequence8';
import CanvasImageSequenceSample9 from '../canvas-image-sequence9';

import MathfEaseSample from '../mathf-ease';
import RafSample from '../raf';
import RafSample2 from '../raf2';
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
import VectorDomSample from '../vector-dom';
import VectorDomSample2 from '../vector-dom2';
import VectorDomSample3 from '../vector-dom3';
import RayCastingSample from '../raycasting';
import RayCasting2Sample from '../raycasting2';
import RayCasting3Sample from '../raycasting3';
import PerlinNoiseSample from '../perlin-noise';
import QuaternionSample from '../quaternion';

// import VideoProgressSample from '../playground/video-progress';

import ScrollDemoSample from '../scroll-demo';
import ScrollDemoSample2 from '../scroll-demo2';
import ScrollDemoSample3 from '../scroll-demo3';
import ScrollDemoSample4 from '../scroll-demo4';
import ScrollDemoSample5 from '../scroll-demo5';

import XSample from '../x';
import X2Sample from '../x2';

import TextSplitSample from '../text-split';
import VideoProgressSample from '../video-progress';


import WebGlSample from '../webgl';

const samples = {
  'easerDisableRafSample': EaserDisableRafSample,
  'easerSample': EaserSample,
  'interpolateSample': InterpolateSample,
  'mathfEaseSample': MathfEaseSample,
  'multiInterpolateSample': MultiInterpolateSample,
  'cssVarInterpolateSample': CssVarInterpolateSample,
  'cssVarInterpolateSample2': CssVarInterpolateSample2,
  'cssVarInterpolateSample3': CssVarInterpolateSample3,
  'canvasImageSequenceSample': CanvasImageSequenceSample,
  'canvasImageSequenceSample2': CanvasImageSequenceSample2,
  'canvasImageSequenceSample3': CanvasImageSequenceSample3,
  'canvasImageSequenceSample4': CanvasImageSequenceSample4,
  'canvasImageSequenceSample5': CanvasImageSequenceSample5,
  'canvasImageSequenceSample6': CanvasImageSequenceSample6,
  'canvasImageSequenceSample7': CanvasImageSequenceSample7,
  'canvasImageSequenceSample8': CanvasImageSequenceSample8,
  'canvasImageSequenceSample9': CanvasImageSequenceSample9,
  'rafSample': RafSample,
  'rafSample2': RafSample2,
  'rafTimerSample': RafTimerSample,
  'rafProgressSample': RafProgressSample,
  'playgroundSample': PlaygroundSample,
  'offScreenCanvasSample': OffScreenCanvasSample,
  'catmullRomSample': CatmullRomSample,
  'hermitCurveSample': HermiteCurveSample,
  'bezierCurveSample': BezierCurveSample,
  'videoProgressSample': VideoProgressSample,
  'matrixIVSample': MatrixIVSample,
  'matrixIVSample2': MatrixIVSample2,
  'matrixIVSample3': MatrixIVSample3,
  'pseudo3dCanvasSample': Pseudo3dCanvasSample,
  'vectorDomSample': VectorDomSample,
  'vectorDomSample2': VectorDomSample2,
  'vectorDomSample3': VectorDomSample3,
  'rayCastingSample': RayCastingSample,
  'rayCasting2Sample': RayCasting2Sample,
  'rayCasting3Sample': RayCasting3Sample,
  'quaternionSample': QuaternionSample,
  'xSample': XSample,
  'x2Sample': X2Sample,
  'domWatcherSample': DomWatcherSample,
  'perlinNoiseSample': PerlinNoiseSample,
  'scrollDemoSample': ScrollDemoSample,
  'scrollDemoSample2': ScrollDemoSample2,
  'scrollDemoSample3': ScrollDemoSample3,
  'scrollDemoSample4': ScrollDemoSample4,
  'scrollDemoSample5': ScrollDemoSample5,
  'textSplitSample': TextSplitSample,
  'webGlSample': WebGlSample
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


window.addEventListener('load', () => {
  new Main();
});
