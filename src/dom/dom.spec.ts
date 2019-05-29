
import { is } from '../is/is';
import { dom } from '../dom/dom';
import test from 'ava';


test('Dom is defined', t => {
    t.is(is.defined(dom), true);
})