import {is} from './is';
import test from 'ava';

test('boolean', t => {
  t.is(is.boolean(false), true);
  t.is(is.boolean(true), true);
  t.is(is.boolean('hello'), false);
  t.is(is.boolean(1), false);
});

test('array', t => {
  t.is(is.array([]), true);
  t.is(is.array([1, 2]), true);
  t.is(is.array([{}, {}]), true);
  t.is(is.array('hello'), false);
  t.is(is.array(1), false);
  t.is(is.array({}), false);
});

test('string', t => {
  t.is(is.string('hello'), true);
  t.is(is.string(2), false);
  t.is(is.string({}), false);
});

test('date', t => {
  t.is(is.date(new Date()), true);
  t.is(is.date('hello'), false);
  t.is(is.date({}), false);
});

test('number', t => {
  t.is(is.number(3), true);
  t.is(is.number('hello'), false);
  t.is(is.number({}), false);
});

test('function', t => {
  t.is(
    is.functionLike(() => {}),
    true
  );
  t.is(is.functionLike('hello'), false);
  t.is(is.functionLike({}), false);
  t.is(is.functionLike(undefined), false);
});

test('null', t => {
  t.is(is.nullLike(null), true);
  t.is(is.nullLike(undefined), false);
  t.is(is.nullLike(2), false);
});

test('undefined', t => {
  t.is(is.undefined(undefined), true);
  t.is(is.undefined(null), false);
  t.is(is.undefined(2), false);
});

test('defined', t => {
  t.is(is.defined(undefined), false);
  t.is(is.defined(null), true);
  t.is(is.defined(2), true);
  t.is(is.defined('hello'), true);
});

test('regex', t => {
  t.is(is.regex(new RegExp(/test/i)), true);
  t.is(is.regex(/test/i), true);
  t.is(is.regex(null), false);
  t.is(is.regex(2), false);
});

test('object', t => {
  t.is(is.object({}), true);
  t.is(is.object(null), false);
  t.is(is.object(2), false);
  t.is(is.object([]), false);
});

test('int', t => {
  t.is(is.int(2), true);
  t.is(is.int(null), false);
  t.is(is.int(2.22), false);
  t.is(is.int([]), false);
});

test('float', t => {
  t.is(is.float(2.22), true);
  t.is(is.float(null), false);
  t.is(is.float(2), false);
  t.is(is.float(10), false);
  t.is(is.float([]), false);
});

test('multipleOf', t => {
  t.is(is.multipleOf('hello', 0), false);
  t.is(is.multipleOf(4, 2), true);
  t.is(is.multipleOf(10, 5), true);
  t.is(is.multipleOf(5, 5), true);
  t.is(is.multipleOf(3, 5), false);
  t.is(is.multipleOf(20, 3), false);
});

test('powerOf2', t => {
  t.is(is.powerOf2(2), true);
  t.is(is.powerOf2(3), false);
  t.is(is.powerOf2(4), true);
  t.is(is.powerOf2(6), false);
  t.is(is.powerOf2(8), true);
  t.is(is.powerOf2(12), false);
  t.is(is.powerOf2(64), true);
  t.is(is.powerOf2(128), true);
  t.is(is.powerOf2(129), false);
});

test('even', t => {
  t.is(is.even(2), true);
  t.is(is.even(4), true);
  t.is(is.even(3), false);
  t.is(is.even(9), false);
  t.is(is.even([]), false);
  t.is(is.even('hello'), false);
});

test('odd', t => {
  t.is(is.odd(2), false);
  t.is(is.odd(4), false);
  t.is(is.odd(3), true);
  t.is(is.odd(9), true);
  t.is(is.odd([]), false);
  t.is(is.odd('hello'), false);
});

test('nan', t => {
  t.is(is.nan(NaN), true);
  t.is(is.nan('test'), false);
  t.is(is.nan(4), false);
  t.is(is.nan(5), false);
});

test('cssHex', t => {
  t.is(is.cssHex('#FFFFFF'), true);
  t.is(is.cssHex('FFFFFF'), false);
  t.is(is.cssHex('no'), false);
  t.is(is.cssHex(0), false);
});

test('hex', t => {
  t.is(is.hex('#FFFFFF'), false);
  t.is(is.hex('FFFFFF'), true);
  t.is(is.hex('ffffff'), true);
  t.is(is.hex('no'), false);
  t.is(is.hex(0), false);
});

test('cssRgba', t => {
  t.is(is.cssRgba('rgba(255, 255, 255, 255, 0.3)'), true);
  t.is(is.cssRgba('rgba()'), true);
  t.is(is.cssRgba(9), false);
});

test('cssRgb', t => {
  t.is(is.cssRgb('rgb(255, 255, 255, 255, 0.3)'), true);
  t.is(is.cssRgb('rgb()'), true);
  t.is(is.cssRgb(9), false);
});
