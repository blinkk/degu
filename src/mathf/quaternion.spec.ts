
import { Vector } from './vector';
import { Quaternion } from './quaternion';
import { mathf } from './mathf';
import test from 'ava';

test('Create', t => {
    const q = new Quaternion(1, 2, 3, 4);
    t.is(q.x, 1);
    t.is(q.y, 2);
    t.is(q.z, 3);
    t.is(q.w, 4);
});

// X-Y-Z orientation
// https://quaternions.online/
test('From EulerVector', t => {
    let eular = new Vector(0, 0, 0);
    let q = Quaternion.fromEulerVector(eular);
    t.is(q.x, 0);
    t.is(q.y, 0);
    t.is(q.z, 0);
    t.is(q.w, 1);

    q = Quaternion.fromEuler(180, 20, 50);
    t.is(mathf.toFixed(q.w, 3), mathf.toFixed(-0.073, 3));
    t.is(mathf.toFixed(q.x, 3), mathf.toFixed(0.893, 3));
    t.is(mathf.toFixed(q.y, 3), mathf.toFixed(-0.416, 3));
    t.is(mathf.toFixed(q.z, 3), mathf.toFixed(0.157, 3));

    q = Quaternion.fromEulerVector(new Vector(180, 20, 50));
    t.is(mathf.toFixed(q.w, 3), mathf.toFixed(-0.073, 3));
    t.is(mathf.toFixed(q.x, 3), mathf.toFixed(0.893, 3));
    t.is(mathf.toFixed(q.y, 3), mathf.toFixed(-0.416, 3));
    t.is(mathf.toFixed(q.z, 3), mathf.toFixed(0.157, 3));

    q = Quaternion.fromEuler(30, 40, 50);
    t.is(mathf.toFixed(q.w, 3), mathf.toFixed(0.785, 3));
    t.is(mathf.toFixed(q.x, 3), mathf.toFixed(0.360, 3));
    t.is(mathf.toFixed(q.y, 3), mathf.toFixed(0.197, 3));
    t.is(mathf.toFixed(q.z, 3), mathf.toFixed(0.464, 3));

});

test('To EulerVector', t => {
    let e = new Vector(180, 20, 50);
    let q = Quaternion.fromEulerVector(e);
    let r = Quaternion.toEulerVector(q);
    t.is(Math.round(e.x), Math.round(r.x));
    t.is(Math.round(e.y), Math.round(r.y));
    t.is(Math.round(e.z), Math.round(r.z));
    t.is(Math.round(e.w), Math.round(r.w));

    e = new Vector(-30, 20, 90);
    q = Quaternion.fromEulerVector(e);
    r = Quaternion.toEulerVector(q);
    t.is(Math.round(e.x), Math.round(r.x));
    t.is(Math.round(e.y), Math.round(r.y));
    t.is(Math.round(e.z), Math.round(r.z));
    t.is(Math.round(e.w), Math.round(r.w));


    let test = (x: number, y: number, z: number) => {
        let e = new Vector(x, y, z).toEularVector();
        let q = Quaternion.fromEulerVector(e);
        let r = Quaternion.toEulerVector(q);
        let diffX = e.x - r.x;
        let diffY = e.y - r.y;
        let diffZ = e.z - r.z;
        let diffW = e.w - r.w;
        t.is(diffW < 0.1, true);
        t.is(diffX < 0.1, true);
        t.is(diffY < 0.1, true);
        t.is(diffZ < 0.1, true);
    }

    let tests = [
        [0, 0, 0],
        [12, 13, 15],
        [20, 20, 20],
        [30, 30, 30],
        [40, 0, -20],
        [50, 50, 50],
        [60, 60, 60],
        [70, 70, 70],
        [-40, 39, 10],
        [20, 50, 5],
        [-60, 20, 90],
        [0, 90, 0],
        [-2, 40, 100],
        [150, 20, 90],
        [160, 62, 63],
    ]

    tests.forEach((t) => {
        test(t[0], t[1], t[2]);
    })

});