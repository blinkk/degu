import * as is from '../is/is';
import {test} from '../testing/test-helpers';
import {CssVarInterpolate} from './css-var-interpolate';

test('CssVarInterpolate is defined', (t) => {
  t.is(is.defined(CssVarInterpolate), true);
});
