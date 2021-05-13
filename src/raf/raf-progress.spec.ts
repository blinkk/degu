import * as is from '../is/is';
import {RafProgress} from './raf-progress';
import test from 'ava';

test('Raf Progress is defined', t => {
  t.is(is.defined(RafProgress), true);
});
