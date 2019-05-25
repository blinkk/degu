import '../styles/index.sass';

// Examples.
import RafSample from '../raf';
import RafTimerSample from '../raf-timer';
import EaserSample from '../easer';
import EaserDisableRafSample from '../easer-disable-raf';
import InterpolateSample from '../interpolate';
import MathfEaseSample from '../mathf-ease';

const samples = {
  'rafSample': RafSample,
  'rafTimerSample': RafTimerSample,
  'easerSample': EaserSample,
  'easerDisableRafSample': EaserDisableRafSample,
  'interpolateSample': InterpolateSample,
  'mathfEaseSample': MathfEaseSample
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
      new samples[className]();
    }

  }

}


new Main();
