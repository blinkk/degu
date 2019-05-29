
import { is } from '../is/is';
import { Raf } from './raf';
import test from 'ava';


test('Raf Progress is defined', t => {
    t.is(is.defined(Raf), true);
})