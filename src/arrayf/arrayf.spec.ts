import { arrayf } from './arrayf';
import test from 'ava';

test('max', t => {
  type Val = {a: number, b: number, c: number};
  const valX = { a: 2, b: 3, c: 7 };
  const valY = { a: 1, b: 4, c: 7 };
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
