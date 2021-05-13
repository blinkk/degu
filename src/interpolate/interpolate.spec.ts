import {Interpolate} from './interpolate';
import * as mathf from '../mathf/mathf';
import {EASE} from '../ease/ease';
import test from 'ava';

test('linear interpolation', t => {
  const inter = new Interpolate({
    from: 0,
    to: 100,
    easeFunction: EASE.linear,
  });

  t.is(inter.calculate(0), 0);
  t.is(inter.calculate(0.1), 10);
  t.is(inter.calculate(0.2), 20);
  t.is(inter.calculate(0.3), 30);
  t.is(inter.calculate(0.4), 40);
  t.is(inter.calculate(0.5), 50);
  t.is(inter.calculate(0.6), 60);
  t.is(inter.calculate(0.7), 70);
  t.is(inter.calculate(0.8), 80);
  t.is(inter.calculate(0.9), 90);
  t.is(inter.calculate(1), 100);
});

test('sin interpolation', t => {
  const inter = new Interpolate({
    from: 0,
    to: 100,
    easeFunction: EASE.easeInSine,
  });

  t.is(mathf.int(inter.calculate(0) as number), 0);
  t.is(mathf.int(inter.calculate(0.1) as number), 1);
  t.is(mathf.int(inter.calculate(0.2) as number), 5);
  t.is(mathf.int(inter.calculate(0.3) as number), 11);
  t.is(mathf.int(inter.calculate(0.4) as number), 19);
  t.is(mathf.int(inter.calculate(0.5) as number), 29);
  t.is(mathf.int(inter.calculate(0.6) as number), 41);
  t.is(mathf.int(inter.calculate(0.7) as number), 55);
  t.is(mathf.int(inter.calculate(0.8) as number), 69);
  t.is(mathf.int(inter.calculate(0.9) as number), 84);
  t.is(mathf.int(inter.calculate(1) as number), 100);
});

test('negative interpolation', t => {
  const inter = new Interpolate({
    from: 0,
    to: -100,
    easeFunction: EASE.linear,
  });

  t.is(inter.calculate(0), 0);
  t.is(inter.calculate(0.1), -10);
  t.is(inter.calculate(0.5), -50);
  t.is(inter.calculate(0.9), -90);
  t.is(inter.calculate(1), -100);
});

test('unit interpolation', t => {
  let inter = new Interpolate({
    from: '0px',
    to: '100px',
    easeFunction: EASE.linear,
  });
  t.is(inter.calculate(0.3), '30px');

  inter = new Interpolate({
    from: '0vw',
    to: '100vw',
    easeFunction: EASE.linear,
  });
  t.is(inter.calculate(0.3), '30vw');
});

test('negative unit interpolation', t => {
  const inter = new Interpolate({
    from: '0px',
    to: '-100px',
    easeFunction: EASE.linear,
  });
  t.is(inter.calculate(0.3), '-30px');
});

test('color interpolation hex', t => {
  const inter = new Interpolate({
    from: '#FFFFFF',
    to: '#000000',
    easeFunction: EASE.linear,
  });
  t.is(inter.calculate(0.5), 'rgba(127, 127, 127, 1)');
});

test('color interpolation rgba', t => {
  const inter = new Interpolate({
    from: 'rgba(255, 255, 255, 0)',
    to: 'rgba(0,0,0,1)',
    easeFunction: EASE.linear,
  });
  t.is(inter.calculate(0.5), 'rgba(127, 127, 127, 0.5)');
});

test('color interpolation rgb', t => {
  const inter = new Interpolate({
    from: 'rgb(255, 255, 255)',
    to: 'rgb(0,0,0)',
    easeFunction: EASE.linear,
  });
  t.is(inter.calculate(0.5), 'rgba(127, 127, 127, 1)');
});
