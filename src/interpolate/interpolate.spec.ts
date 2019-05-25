import { Interpolate } from './interpolate';
import { mathf } from '../mathf/mathf';
import { EASE } from '../ease/ease';
import test from 'ava';

test('linear interpolation', t => {

    let inter = new Interpolate({
        from: 0,
        to: 100,
        easeFunction: EASE.linear
    });

    t.is(inter.calculate(0), 0)
    t.is(inter.calculate(0.1), 10)
    t.is(inter.calculate(0.2), 20)
    t.is(inter.calculate(0.3), 30)
    t.is(inter.calculate(0.4), 40)
    t.is(inter.calculate(0.5), 50)
    t.is(inter.calculate(0.6), 60)
    t.is(inter.calculate(0.7), 70)
    t.is(inter.calculate(0.8), 80)
    t.is(inter.calculate(0.9), 90)
    t.is(inter.calculate(1), 100)
});

test('sin interpolation', t => {

    let inter = new Interpolate({
        from: 0,
        to: 100,
        easeFunction: EASE.easeInSine
    });

    t.is(mathf.int(inter.calculate(0)), 0)
    t.is(mathf.int(inter.calculate(0.1)), 1)
    t.is(mathf.int(inter.calculate(0.2)), 5)
    t.is(mathf.int(inter.calculate(0.3)), 11)
    t.is(mathf.int(inter.calculate(0.4)), 19)
    t.is(mathf.int(inter.calculate(0.5)), 29)
    t.is(mathf.int(inter.calculate(0.6)), 41)
    t.is(mathf.int(inter.calculate(0.7)), 55)
    t.is(mathf.int(inter.calculate(0.8)), 69)
    t.is(mathf.int(inter.calculate(0.9)), 84)
    t.is(mathf.int(inter.calculate(1)), 100)
});