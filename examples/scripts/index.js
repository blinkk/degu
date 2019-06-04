import '../styles/index.sass';

// Examples.
import DomWatcher from '../dom-watcher';

import EaserDisableRafSample from '../easer-disable-raf';
import EaserSample from '../easer';

import InterpolateSample from '../interpolate';
import MultiInterpolateSample from '../multi-interpolate';
import CssVarInterpolateSample from '../css-var-interpolate';

import MathfEaseSample from '../mathf-ease';
import RafSample from '../raf';
import RafTimerSample from '../raf-timer';
import RafProgressSample from '../raf-progress';

import PlaygroundSample from '../playground';
import DomWatcherSample from '../dom-watcher';
import OffScreenCanvasSample from '../off-screen-canvas';

import XSample from '../x';

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
  'domWatcherSample': DomWatcherSample,
  'offScreenCanvasSample': OffScreenCanvasSample,
  'xSample': XSample
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
