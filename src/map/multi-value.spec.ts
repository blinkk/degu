import { MultiValueMap } from './multi-value';
import test from 'ava';

const tests: Array<[any, any]> = [
  [[1, 2], 1],
  [[{}, 3], 2],
  [[{}, 4], 3],
  [[6, 7], 5],
  [['a', 'b'], 8],
  [[null, 'boy howdy'], 13]
];

test('MultiValueMap constructor should match native Map functionality w/ multiple values used as the key', async t => {
  const multivalue = new MultiValueMap(tests);
  tests.forEach(([testInput, expectedResult]) => {
    t.is(multivalue.get(testInput), expectedResult);
    t.is(multivalue.get(testInput.slice()), expectedResult);
  });
});

test('MultiValueMap `clear()` should match native Map functionality w/ multiple values used as the key', async t => {
  const multivalue = new MultiValueMap(tests);
  multivalue.clear();
  tests.forEach(([testInput, expectedResult]) => {
    t.false(multivalue.has(testInput));
    t.false(multivalue.has(testInput.slice()));
    t.is(multivalue.get(testInput), undefined);
    t.is(multivalue.get(testInput.slice()), undefined);
  });
});

test('MultiValueMap `delete()` should match native Map functionality w/ multiple values used as the key', async t => {
  let multivalue = new MultiValueMap(tests);
  tests.forEach(([testInput, expectedResult]) => {
    multivalue.delete(testInput);
    t.false(multivalue.has(testInput));
    t.is(multivalue.get(testInput), undefined);
  });

  multivalue = new MultiValueMap(tests);
  tests.forEach(([testInput, expectedResult]) => {
    multivalue.delete(testInput.slice());
    t.false(multivalue.has(testInput));
    t.is(multivalue.get(testInput), undefined);
  });
});

test('MultiValueMap `get()` should match native Map functionality w/ multiple values used as the key', async t => {
  const multivalue = new MultiValueMap(tests);
  tests.forEach(([testInput, expectedResult]) => {
    t.is(multivalue.get(testInput), expectedResult);
    t.is(multivalue.get(testInput.slice()), expectedResult);
  });
});

test('MultiValueMap `has()` should match native Map functionality w/ multiple values used as the key', async t => {
  const multivalue = new MultiValueMap(tests);
  tests.forEach(([testInput, expectedResult]) => {
    t.true(multivalue.has(testInput));
    t.true(multivalue.has(testInput.slice()));
    multivalue.delete(testInput);
    t.false(multivalue.has(testInput));
  });
});

test('MultiValueMap `keys()` should return the list of keys used for each value', async t => {
  const keys = new MultiValueMap(tests).keys();
  let i = 0;
  let next = keys.next();
  while (!next.done) {
    t.deepEqual(tests[i][0], next.value);
    i++;
    next = keys.next();
  }
  t.is(i, tests.length);
});

test('MultiValueMap `set()` should match native Map functionality w/ multiple values used as the key', async t => {
  tests.forEach(([testInput, expectedResult]) => {
    const multivalue = new MultiValueMap();
    multivalue.set(testInput, expectedResult);
    t.is(multivalue.get(testInput), expectedResult);
    t.is(multivalue.get(testInput.slice()), expectedResult);
  });
});
