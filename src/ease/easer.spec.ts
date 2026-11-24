import * as is from '../is/is';
import {test} from '../testing/test-helpers';
import {Easer} from './easer';

test('Easer is defined', (t) => {
  t.is(is.defined(Easer), true);
});
