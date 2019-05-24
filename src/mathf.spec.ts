import { mathf } from "./mathf";
import test from 'ava';



test("fixDigits", t => {
    t.is(mathf.fixDigits(20.12345, 0), 20);
    t.is(mathf.fixDigits(20.12345, 1), 20.1);
    t.is(mathf.fixDigits(20.12345, 2), 20.12);
    t.is(mathf.fixDigits(20.12345, 4), 20.1234);
});

test("int", t => {
    t.is(mathf.int(20.311), 20);
    t.is(mathf.int(20.32), 20);
    t.is(mathf.int(20), 20);
});


test("calculateCenterOffset", t => {
    t.is(mathf.calculateCenterOffset(8, 5), 1.5);
    t.is(mathf.calculateCenterOffset(10, 5), 2.5);
});

test("angleDistanceDegree", t => {

    t.is(mathf.angleDistanceDegree(10, 10), 0);
    t.is(
        mathf.int(mathf.angleDistanceDegree(30, 10))
        , -20);
    t.is(
        mathf.int(mathf.angleDistanceDegree(10, 50))
        , 40);
    t.is(
        mathf.int(mathf.angleDistanceDegree(180, 10))
        , -170);
    t.is(
        mathf.int(mathf.angleDistanceDegree(10, 340))
        , -30);
});

test("scaleY1", t => {
    t.is(
        mathf.scaleY1(5, 10, 20),
        10);
    t.is(
        mathf.scaleY1(2, 10, 20),
        4);
});

test("scaleY2", t => {
    t.is(
        mathf.scaleY2(5, 10, 3),
        6);
    t.is(
        mathf.scaleY2(2, 10, 20),
        100);
});


test("aspectRatio", t => {
    t.is(mathf.aspectRatio({ width: 500, height: 500 }), 1);
    t.is(mathf.aspectRatio({ width: 1000, height: 500 }), 2);
    t.is(
        mathf.fixDigits(mathf.aspectRatio({ width: 1600, height: 1080 }), 2),
        mathf.fixDigits(1.48, 2));
});


test("resizeDimentionalBoxToWidth", t => {
    t.deepEqual(
        mathf.resizeDimentionalBoxToWidth({ width: 500, height: 500 }, 250),
        { width: 250, height: 250 });
    t.deepEqual(
        mathf.resizeDimentionalBoxToWidth({ width: 250, height: 500 }, 800),
        { width: 800, height: 1600 });
    t.deepEqual(
        mathf.resizeDimentionalBoxToWidth({ width: 10, height: 12 }, 800),
        { width: 800, height: 960 });
});


test("resizeDimentionalBoxToHeight", t => {
    t.deepEqual(
        mathf.resizeDimentionalBoxToHeight({ width: 500, height: 500 }, 250),
        { width: 250, height: 250 });
    t.deepEqual(
        mathf.resizeDimentionalBoxToHeight({ width: 250, height: 500 }, 800),
        { width: 400, height: 800 });
    t.deepEqual(
        mathf.resizeDimentionalBoxToHeight({ width: 10, height: 16 }, 800),
        { width: 500, height: 800 });
});
