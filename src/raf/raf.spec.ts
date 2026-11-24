import * as is from '../is/is';
import {test} from '../testing/test-helpers';
import {Raf} from './raf';

test('Raf Progress is defined', (t) => {
  t.is(is.defined(Raf), true);
});
