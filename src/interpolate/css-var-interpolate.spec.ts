
import { is } from '../is/is';
import { CssVarInterpolate } from './css-var-interpolate';
import test from 'ava';


test('CssVarInterpolate is defined', t => {
    t.is(is.defined(CssVarInterpolate), true);
})