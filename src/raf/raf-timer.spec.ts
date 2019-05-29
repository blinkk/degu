

import { is } from '../is/is';
import { RafTimer } from './raf-timer';
import test from 'ava';


test('Raf Progress is defined', t => {
    t.is(is.defined(RafTimer), true);
})