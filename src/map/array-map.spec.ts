import {test} from '../testing/test-helpers';
import {ArrayMap} from './array-map';

test('ArrayMap should always return an array', async (t) => {
  const map = new ArrayMap();
  t.true(Array.isArray(map.get(false)));
  t.true(Array.isArray(map.get(1)));
  t.true(Array.isArray(map.get({})));
  t.true(Array.isArray(map.get(0)));
  t.true(Array.isArray(map.get(null)));
  t.true(Array.isArray(map.get(-1)));
  t.true(Array.isArray(map.get([])));
  t.true(Array.isArray(map.get('foo')));
});
