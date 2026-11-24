import * as is from '../is/is';
import {test} from '../testing/test-helpers';
import {RafTimer} from './raf-timer';

test('Raf Progress is defined', (t) => {
  t.is(is.defined(RafTimer), true);
});
