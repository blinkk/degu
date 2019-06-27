import { cssUnit } from './css-unit';
import test from 'ava';

test('parse values', t => {
    t.is(cssUnit.parse('1px').unit, 'px');
    t.is(cssUnit.parse('1px').type, 'unit');
    t.is(cssUnit.parse('1px').value, 1);

    t.is(cssUnit.parse('10vw').unit, 'vw');
    t.is(cssUnit.parse('1px').type, 'unit');
    t.is(cssUnit.parse('10vw').value, 10);

    t.is(cssUnit.parse('-10vw').unit, 'vw');
    t.is(cssUnit.parse('-1px').type, 'unit');
    t.is(cssUnit.parse('-10vw').value, -10);
    t.is(cssUnit.parse('0.5em').value, 0.5);
    t.is(cssUnit.parse('-0.5em').value, -0.5);
    t.is(cssUnit.parse('-0.5em').unit, 'em');


    t.is(cssUnit.parse('10%').unit, '%');
    t.is(cssUnit.parse('1px').type, 'unit');
    t.is(cssUnit.parse('10vw').value, 10);


    t.is(cssUnit.parse('10').unit, null);
    t.is(cssUnit.parse('1px').type, 'unit');
    t.is(cssUnit.parse('10').value, 10);
});

test('parse hex', t => {
    t.is(cssUnit.parse('#FFFFFF').unit, null);
    t.is(cssUnit.parse('#FFFFFF').originalValue, '#FFFFFF');
    t.is(cssUnit.parse('#FFFFFF').type, 'cssHex');
    t.deepEqual(cssUnit.parse('#FFFFFF').value, {
        r: 255,
        g: 255,
        b: 255,
        a: 1
    });
});


test('parse rgba', t => {
    let rgba = 'rgba( 255, 255, 255,0.3)';
    t.is(cssUnit.parse(rgba).unit, null);
    t.is(cssUnit.parse(rgba).originalValue, rgba);
    t.is(cssUnit.parse(rgba).type, 'rgba');
    t.deepEqual(cssUnit.parse(rgba).value, {
        r: 255,
        g: 255,
        b: 255,
        a: 0.3
    });
});

test('parse rgb', t => {
    let rgb = 'rgb( 255, 255, 255)';
    t.is(cssUnit.parse(rgb).unit, null);
    t.is(cssUnit.parse(rgb).originalValue, rgb);
    t.is(cssUnit.parse(rgb).type, 'rgb');
    t.deepEqual(cssUnit.parse(rgb).value, {
        r: 255,
        g: 255,
        b: 255,
        a: 1
    });
});
