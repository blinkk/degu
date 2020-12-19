import { DefaultMap } from './default';
import test from 'ava';

const testDefaultFns = [
  (x: number) => x * 2,
  (x: number) => x + 1,
  (x: number) => `${x}!`
];

test('DefaultMap should generate default values', async t => {
  testDefaultFns.forEach((defaultFn) => {
    const map = new DefaultMap<number, any>([], defaultFn);
    for (let i = -1; i < 2; i++) {
      t.is(map.get(i), defaultFn(i));
    }
  });
});

test('DefaultMap should not generate defaults over set values', async t => {
  testDefaultFns.forEach((defaultFn) => {
    const map = new DefaultMap<number, any>([], defaultFn);
    for (let i = -1; i < 2; i++) {
      map.set(i, i);
      t.is(map.get(i), i);
    }
  });
});

test('DefaultMap should not generate defaults over initialized values', async t => {
  testDefaultFns.forEach((defaultFn) => {
    const testValues: Array<[number, any]> = [[-1, -1], [0, 0], [1, 1]];
    const map = new DefaultMap<number, any>(testValues, defaultFn);
    for (let i = -1; i < 2; i++) {
      t.is(map.get(i), i);
    }
  });
});

test('DefaultMap usingFunction should return an empty map using the given function to generate defaults', async t => {
  testDefaultFns.forEach((defaultFn) => {
    const map = DefaultMap.usingFunction<number, any>(defaultFn);
    for (let i = -1; i < 2; i++) {
      map.set(i, i);
      t.is(map.get(i), i);
    }
  });
});
