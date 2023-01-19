import * as arrayf from './arrayf';
import test from 'ava';

test('max', t => {
  type Val = {a: number; b: number; c: number};
  const valX = {a: 2, b: 3, c: 7};
  const valY = {a: 1, b: 4, c: 7};
  const values = [valX, valY];
  const a = (value: Val) => value.a;
  const b = (value: Val) => value.b;
  const c = (value: Val) => value.c;
  t.is(arrayf.max(values, a), valX);
  t.is(arrayf.max(values, b), valY);
  t.is(arrayf.max(values, c), valX);
  t.is(arrayf.max(values, c, b), valY);
  t.is(arrayf.max(values, c, a), valX);
});

test('min', t => {
  type Val = {a: number; b: number; c: number};
  const valX = {a: 2, b: 3, c: 7};
  const valY = {a: 1, b: 4, c: 7};
  const values = [valX, valY];
  const a = (value: Val) => value.a;
  const b = (value: Val) => value.b;
  const c = (value: Val) => value.c;
  t.is(arrayf.min(values, a), valY);
  t.is(arrayf.min(values, b), valX);
  t.is(arrayf.min(values, c), valX);
  t.is(arrayf.min(values, c, b), valX);
  t.is(arrayf.min(values, c, a), valY);
});

test('loopSlice', t => {
  const values = [1, 2, 3, 4, 5, 6, 7, 8];
  t.deepEqual(arrayf.loopSlice(values, 0, 1), [1]);
  t.deepEqual(arrayf.loopSlice(values, 0, 1, 1), [1]);
  t.deepEqual(arrayf.loopSlice(values, 0, 1, -1), [1, 8, 7, 6, 5, 4, 3]);
  t.deepEqual(arrayf.loopSlice(values, 4, 1, -1), [5, 4, 3]);
  t.deepEqual(arrayf.loopSlice(values, 4, 6, -1), [5, 4, 3, 2, 1, 8]);
  t.deepEqual(arrayf.loopSlice(values, 4, 6), [5, 6]);
  t.deepEqual(arrayf.loopSlice(values, 4, 7, 1), [5, 6, 7]);
});
