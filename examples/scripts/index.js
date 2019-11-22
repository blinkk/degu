import '../styles/index.sass';

import 'intersection-observer';

// Examples.

// import VideoProgressSample from '../playground/video-progress';
import BezierCurveSample from '../bezier-curve';
import CanvasImageSequenceSample from '../canvas-image-sequence';
import CanvasImageSequenceSample10 from '../canvas-image-sequence10';
import CanvasImageSequenceSample2 from '../canvas-image-sequence2';
import CanvasImageSequenceSample3 from '../canvas-image-sequence3';
import CanvasImageSequenceSample4 from '../canvas-image-sequence4';
import CanvasImageSequenceSample5 from '../canvas-image-sequence5';
import CanvasImageSequenceSample7 from '../canvas-image-sequence7';
import CanvasImageSequenceSample8 from '../canvas-image-sequence8';
import CanvasImageSequenceSample9 from '../canvas-image-sequence9';
import CatmullRomSample from '../catmull-rom';
import CssVarInterpolateSample from '../css-var-interpolate';
import CssVarInterpolateSample2 from '../css-var-interpolate2';
import CssVarInterpolateSample3 from '../css-var-interpolate3';
import DomCanvasSample from '../dom-canvas';
import DomWatcherSample from '../dom-watcher';
import EaserDisableRafSample from '../easer-disable-raf';
import EaserSample from '../easer';
import HermiteCurveSample from '../hermite-curve';
import InterpolateSample from '../interpolate';
import MathfEaseSample from '../mathf-ease';
import MatrixIVSample from '../matrixIV';
import MatrixIVSample2 from '../matrixIV2';
import MatrixIVSample3 from '../matrixIV3';
import MultiInterpolateSample from '../multi-interpolate';
import OffScreenCanvasSample from '../off-screen-canvas';
import PerlinNoiseSample from '../perlin-noise';
import PlaygroundSample from '../playground';
import Pseudo3dCanvasSample from '../pseudo-3d-canvas';
import QuaternionSample from '../quaternion';
import RafProgressSample from '../raf-progress';
import RafSample from '../raf';
import RafSample2 from '../raf2';
import RafTimerSample from '../raf-timer';
import RayCasting2Sample from '../raycasting2';
import RayCasting3Sample from '../raycasting3';
import RayCastingSample from '../raycasting';
import ScrollDemoSample from '../scroll-demo';
import ScrollDemoSample2 from '../scroll-demo2';
import ScrollDemoSample3 from '../scroll-demo3';
import ScrollDemoSample4 from '../scroll-demo4';
import ScrollDemoSample5 from '../scroll-demo5';
import ThreeObjectViewer from '../three-object-viewer';
import ThreeObjectViewer2 from '../three-object-viewer2';
import ThreeObjectViewer3 from '../three-object-viewer3';
import ThreeObjectViewer4 from '../three-object-viewer4';
import ThreeObjectViewer5 from '../three-object-viewer5';
import ThreeObjectViewer6 from '../three-object-viewer6';
import ThreeObjectViewer7 from '../three-object-viewer7';
import TextSplitSample from '../text-split';
import VectorDomSample from '../vector-dom';
import VectorDomSample2 from '../vector-dom2';
import VectorDomSample3 from '../vector-dom3';
import VideoProgressSample from '../video-progress';
import WebGlImageSequenceSample from '../webgl-image-sequence';
import WebGlImageSequenceSample2 from '../webgl-image-sequence2';
import WebGlImageSequenceSample3 from '../webgl-image-sequence3';
import WebGlImageSequenceSample4 from '../webgl-image-sequence4';
import WebGlImageSequenceSample5 from '../webgl-image-sequence5';
import WebGlImageSequenceSample7 from '../webgl-image-sequence7';
import WebGlImageSequenceSample9 from '../webgl-image-sequence9';
import X2Sample from '../x2';
import XSample from '../x';



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
  'canvasImageSequenceSample7': CanvasImageSequenceSample7,
  'canvasImageSequenceSample8': CanvasImageSequenceSample8,
  'canvasImageSequenceSample9': CanvasImageSequenceSample9,
  'canvasImageSequenceSample10': CanvasImageSequenceSample10,
  'webglImageSequenceSample': WebGlImageSequenceSample,
  'webglImageSequenceSample2': WebGlImageSequenceSample2,
  'webglImageSequenceSample3': WebGlImageSequenceSample3,
  'webglImageSequenceSample4': WebGlImageSequenceSample4,
  'webglImageSequenceSample5': WebGlImageSequenceSample5,
  'webglImageSequenceSample7': WebGlImageSequenceSample7,
  'webglImageSequenceSample9': WebGlImageSequenceSample9,
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
  'domCanvasSample': DomCanvasSample,
  'perlinNoiseSample': PerlinNoiseSample,
  'scrollDemoSample': ScrollDemoSample,
  'scrollDemoSample2': ScrollDemoSample2,
  'scrollDemoSample3': ScrollDemoSample3,
  'scrollDemoSample4': ScrollDemoSample4,
  'scrollDemoSample5': ScrollDemoSample5,
  'threeObjectViewer': ThreeObjectViewer,
  'threeObjectViewer2': ThreeObjectViewer2,
  'threeObjectViewer3': ThreeObjectViewer3,
  'threeObjectViewer4': ThreeObjectViewer4,
  'threeObjectViewer5': ThreeObjectViewer5,
  'threeObjectViewer6': ThreeObjectViewer6,
  'threeObjectViewer7': ThreeObjectViewer7,
  'textSplitSample': TextSplitSample,
  'webGlSample': WebGlSample,
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
