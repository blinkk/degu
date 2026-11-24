import * as is from '../is/is';
import {test} from '../testing/test-helpers';
import {RafProgress} from './raf-progress';

test('Raf Progress is defined', (t) => {
  t.is(is.defined(RafProgress), true);
});
