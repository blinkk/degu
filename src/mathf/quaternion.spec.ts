import {Vector} from './vector';
import {Quaternion} from './quaternion';
import {MatrixIV} from './matrixIV';
import {mathf} from './mathf';
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
  const eular = new Vector(0, 0, 0);
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
  t.is(mathf.toFixed(q.x, 3), mathf.toFixed(0.36, 3));
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

  // TODO (uxder): This case fails.  Need to look into it.
  // e = new Vector(90, 90, 90);
  // q = Quaternion.fromEulerVector(e);
  // r = Quaternion.toEulerVector(q);
  // t.is(e, r);
  // t.is(Math.round(e.x), Math.round(r.x));
  // t.is(Math.round(e.y), Math.round(r.y));
  // t.is(Math.round(e.z), Math.round(r.z));
  // t.is(Math.round(e.w), Math.round(r.w));

  const test = (x: number, y: number, z: number) => {
    const e = new Vector(x, y, z);
    const q = Quaternion.fromEulerVector(e);
    const r = Quaternion.toEulerVector(q);
    const diffX = e.x - r.x;
    const diffY = e.y - r.y;
    const diffZ = e.z - r.z;
    const diffW = e.w - r.w;
    t.is(diffW < 0.1, true);
    t.is(diffX < 0.1, true);
    t.is(diffY < 0.1, true);
    t.is(diffZ < 0.1, true);
  };

  const tests = [
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
  ];

  tests.forEach(t => {
    test(t[0], t[1], t[2]);
  });
});

test('fromRotationMatrixIV', (t: any) => {
  const s = new Quaternion(0, 0, 0, 1);
  const m1 = MatrixIV.fromQuaternion(s);
  let q = Quaternion.fromRotationMatrixIV(m1);
  t.deepEqual(q.toFixed(1), s.toFixed(1));

  const test = (x: number, y: number, z: number, w: number) => {
    const s = new Quaternion(x, y, z, w);
    const m1 = MatrixIV.fromQuaternion(s);
    q = Quaternion.fromRotationMatrixIV(m1);
    t.deepEqual(q.toFixed(1), s.toFixed(1));
  };

  const tests = [
    [0, 0, 0, 1],
    [1, 0, 0, 0],
    [0.7, 0, 0, 0.7],
    [0.5, 0.5, 0.5, 0.5],
    [-0.5, 0.5, 0.5, 0.5],
    [-0.5, -0.5, -0.5, -0.5],
    [-0.25, -0.25, 0.15, 0.7],
    [0.25, 0.25, 0.15, 0.7],
    [0.35, 0.89, 0.15, 1],
    [-0.35, -0.89, 0.15, 1],
    [-0.35, 0.89, -0.15, 1],
  ];

  test(t[0], t[1], t[2], t[3]);
});
