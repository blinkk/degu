
import { is } from '../is/is';
import { Easer } from './easer';
import test from 'ava';


test('Web worker is defined', t => {
    t.is(is.defined(Easer), true);
})