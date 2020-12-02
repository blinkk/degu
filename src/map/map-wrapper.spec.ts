import { MapWrapper } from './map-wrapper';
import test from 'ava';

const tests: Array<[any, any]> = [
  [1, 2],
  [{}, 3],
  [{}, 4],
  [6, 7],
  ['a', 'b'],
  [null, 'boy howdy']
];

test('MapWrapper constructor should match native Map functionality', async t => {
  const wrapped = new MapWrapper(tests);
  const native = new Map(tests);
  tests.forEach(([testInput, expectedResult]) => {
    t.is(wrapped.get(testInput), expectedResult);
    t.is(native.get(testInput), expectedResult);
  });
});

test('MapWrapper `size` should match native Map functionality', async t => {
  tests.forEach(([testInput, expectedResult]) => {
    const wrapped = new MapWrapper();
    const native = new Map();
    wrapped.set(testInput, expectedResult);
    native.set(testInput, expectedResult);
    t.is(wrapped.size, native.size);
  });
});

test('MapWrapper `clear()` should match native Map functionality', async t => {
  const wrapped = new MapWrapper(tests);
  const native = new Map(tests);
  wrapped.clear();
  native.clear();
  tests.forEach(([testInput, expectedResult]) => {
    t.is(wrapped.has(testInput), native.has(testInput));
    t.is(wrapped.get(testInput), native.get(testInput));
  });
});

test('MapWrapper `delete()` should match native Map functionality', async t => {
  const wrapped = new MapWrapper(tests);
  const native = new Map(tests);
  tests.forEach(([testInput, expectedResult]) => {
    wrapped.delete(testInput);
    native.delete(testInput);
    t.is(wrapped.has(testInput), native.has(testInput));
    t.is(wrapped.get(testInput), native.get(testInput));
  });
});

test('MapWrapper `entries()` should match native Map functionality', async t => {
  t.deepEqual(new MapWrapper(tests).entries(), new Map(tests).entries());
  const wrapped = new MapWrapper();
  const native = new Map();
  tests.forEach(([key, value]) => {
    wrapped.set(key, value);
    native.set(key, value);
  });
  t.deepEqual(wrapped.entries(), native.entries());
});

test('MapWrapper `forEach()` should match native Map functionality', async t => {
  const wrapped = new MapWrapper(tests);
  const wrappedResults: any[] = [];
  wrapped.forEach((...args) => wrappedResults.push(args));

  const native = new Map(tests);
  const nativeResults: any[] = [];
  native.forEach((...args) => nativeResults.push(args));

  t.deepEqual(wrappedResults, nativeResults);
});

test('MapWrapper `get()` should match native Map functionality', async t => {
  const wrapped = new MapWrapper(tests);
  const native = new Map(tests);
  tests.forEach(([testInput, expectedResult]) => {
    t.is(wrapped.get(testInput), native.get(testInput));
  });
});

test('MapWrapper `has()` should match native Map functionality', async t => {
  const wrapped = new MapWrapper(tests);
  const native = new Map(tests);
  tests.forEach(([testInput, expectedResult]) => {
    t.is(wrapped.has(testInput), native.has(testInput));
  });
});

test('MapWrapper `keys()` should match native Map functionality', async t => {
  t.deepEqual(new MapWrapper(tests).keys(), new Map(tests).keys());
  const wrapped = new MapWrapper();
  const native = new Map();
  tests.forEach(([key, value]) => {
    wrapped.set(key, value);
    native.set(key, value);
  });
  t.deepEqual(wrapped.keys(), native.keys());
});

test('MapWrapper `set()` should match native Map functionality', async t => {
  tests.forEach(([testInput, expectedResult]) => {
    const wrapped = new MapWrapper();
    const native = new Map();
    wrapped.set(testInput, expectedResult);
    native.set(testInput, expectedResult);
    t.is(wrapped.get(testInput), expectedResult);
    t.is(native.get(testInput), expectedResult);
  });
});

test('MapWrapper `values()` should match native Map functionality', async t => {
  t.deepEqual(new MapWrapper(tests).values(), new Map(tests).values());
  const wrapped = new MapWrapper();
  const native = new Map();
  tests.forEach(([key, value]) => {
    wrapped.set(key, value);
    native.set(key, value);
  });
  t.deepEqual(wrapped.values(), native.values());
});

test('MapWrapper `[Symbol.iterator]()` should match native Map functionality', async t => {
  t.deepEqual(
      new MapWrapper(tests)[Symbol.iterator](),
      new Map(tests)[Symbol.iterator]());
  const wrapped = new MapWrapper();
  const native = new Map();
  tests.forEach(([key, value]) => {
    wrapped.set(key, value);
    native.set(key, value);
  });
  t.deepEqual(wrapped[Symbol.iterator](), native[Symbol.iterator]());
});
