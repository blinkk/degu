import * as is from '../is/is';
import {test} from '../testing/test-helpers';
import * as time from './time';

test('time is defined', (t) => {
  t.is(is.defined(time), true);
});
