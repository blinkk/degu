import {color} from './color';
import test from 'ava';

test('hexToRgbNormalized', t => {
  let normalizedRgb = color.hexToRgbNormalized(0xffffff); // >> [1, 1, 1];
  t.deepEqual(normalizedRgb, [1, 1, 1]);

  normalizedRgb = color.hexToRgbNormalized(0x00000);
  t.deepEqual(normalizedRgb, [0, 0, 0]);
});

test('normaliizedRgbToHex', t => {
  let result = color.normalizedRgbToHex([1, 1, 1]); // >> 0xFFFFFF
  t.is(result, 0xffffff);

  result = color.normalizedRgbToHex([0, 0, 0]);
  t.is(result, 0x000000);
});

test('rgbaLerp', t => {
  let a = {r: 0, g: 0, b: 0, a: 0};
  let b = {r: 255, g: 255, b: 255, a: 1};
  let lerp = color.rgbaLerp(a, b, 0.5);
  let expected = {
    r: 127,
    g: 127,
    b: 127,
    a: 0.5,
  };
  t.deepEqual(lerp, expected);
});

test('rgbToHex', t => {
  let color1 = color.rgbToHex({r: 255, g: 255, b: 255}); // #FFFFFF
  t.is(color1, '#FFFFFF');
  color1 = color.rgbToHex({r: 0, g: 0, b: 0});
  t.is(color1, '#000000');
  color1 = color.rgbToHex({r: 0, g: 0, b: 0, a: 0});
  t.is(color1, '#000000');
});

test('hexToRgba', t => {
  let color1 = color.hexToRgba('#FFFFFF');
  t.deepEqual(color1, {r: 255, g: 255, b: 255, a: 1});
  color1 = color.hexToRgba('#000000');
  t.deepEqual(color1, {r: 0, g: 0, b: 0, a: 1});
});

test('cssToRgba', t => {
  let result = {
    r: 255,
    g: 255,
    b: 255,
    a: 1,
  };
  t.deepEqual(color.cssToRgba('#FFFFFF'), result);
  t.deepEqual(color.cssToRgba('rgba(255, 255, 255, 1)'), result);
  t.deepEqual(color.cssToRgba('rgba( 255,255,255,1)'), result);
  t.deepEqual(color.cssToRgba('rgba( 255 , 255 , 255 ,1)'), result);
  t.deepEqual(color.cssToRgba('rgb(255, 255, 255)'), result);

  let result2 = {
    r: 52,
    g: 85,
    b: 52,
    a: 1,
  };

  t.deepEqual(color.cssToRgba('#345534'), result2);
  t.deepEqual(color.cssToRgba('rgba(52, 85, 52, 1)'), result2);
  t.deepEqual(color.cssToRgba('rgb(52, 85, 52)'), result2);

  // Check invalid cases
  t.deepEqual(color.cssToRgba('hello'), null);
});
