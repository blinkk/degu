import { ArrayMap } from './array-map';
import test from 'ava';

test('ArrayMap should always return an array', async t => {
  const map = new ArrayMap();
  t.true(map.get(false) instanceof Array);
  t.true(map.get(1) instanceof Array);
  t.true(map.get({}) instanceof Array);
  t.true(map.get(0) instanceof Array);
  t.true(map.get(null) instanceof Array);
  t.true(map.get(-1) instanceof Array);
  t.true(map.get([]) instanceof Array);
  t.true(map.get('foo') instanceof Array);
});
