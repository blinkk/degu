
import { time } from './time';
import { is } from '../is/is';
import test from 'ava';

test('time is defined', t => {
    t.is(is.defined(time), true);
})