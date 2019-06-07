
import { mathf } from './mathf';
import { Vector } from './vector';
import test from 'ava';
import { timingSafeEqual } from 'crypto';




test('Create', t => {
    const v = new Vector(2, 3, 2);
    t.is(v.x, 2);
    t.is(v.y, 3);
    t.is(v.z, 2);
    const v2 = Vector.create(2, 3, 2);
    t.is(v2.x, 2);
    t.is(v2.y, 3);
    t.is(v2.z, 2);
});

test('set', t => {
    const v = new Vector(2, 3, 2);
    t.is(v.x, 2);
    t.is(v.y, 3);
    t.is(v.z, 2);
    v.set(2, 3, 4);
});

test('clone', t => {
    const v = new Vector(2, 3, 2);
    const v2 = v.clone();
    const v3 = v.clone();
    t.is(v2.x, v.x);
    t.is(v2.y, v.y);
    t.is(v2.z, v.z);
    t.deepEqual(v2, v3);
    t.deepEqual(v, v3);

    // Static
    const v4 = Vector.clone(v);
    t.deepEqual(v4, v);
});

test('equals', t => {
    const v = new Vector(2, 3, 2);
    const v2 = v.clone();
    const v3 = v.clone();
    const v4 = new Vector(2, 3, 1);
    t.is(v2.equals(v), true);
    t.is(v.equals(v3), true);
    t.is(v.equals(v4), false);
    t.is(v2.equals(v4), false);

    // Static version
    const v5 = new Vector(2, 3, 2);
    const v6 = new Vector(2, 3, 2);
    const v7 = new Vector(4, 4, 1);
    t.is(Vector.equals(v5, v6), true);
    t.is(Vector.equals(v5, v7), false);
});


test('toArray', t => {
    const v = new Vector(1, 3, 2);
    const va = v.toArray();
    t.is(va[0], 1);
    t.is(va[1], 3);
    t.is(va[2], 2);
});

test('fromArray', t => {
    const v = Vector.fromArray([1, 3, 2]);
    t.is(v.x, 1);
    t.is(v.y, 3);
    t.is(v.z, 2);
});