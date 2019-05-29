

import { is } from '../is/is';
import { WebWorker } from './web-worker';
import test from 'ava';


test('Web worker is defined', t => {
    t.is(is.defined(WebWorker), true);
})