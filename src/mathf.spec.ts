import { mathf } from "./mathf";
import test from 'ava';


test("absZero", t => {
    t.is(mathf.absZero(-0), 0);
    t.is(mathf.absZero(0), 0);
    t.is(mathf.absZero(10), 10);
    t.is(mathf.absZero(-10), -10);
});


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


test("calculateScalarToBackgroundCover", t => {

    // Simple scale up
    let parentBox = { width: 500, height: 500 };
    let childBox = { width: 50, height: 50 }
    t.deepEqual(
        mathf.calculateScalarToBackgroundCover(parentBox, childBox),
        {
            width: 500,
            height: 500,
            xOffset: 0,
            yOffset: 0,
            scalar: 10,
        }
    )

    // Simple scale down
    parentBox = { width: 50, height: 50 };
    childBox = { width: 500, height: 500 };
    t.deepEqual(
        mathf.calculateScalarToBackgroundCover(parentBox, childBox),
        {
            width: 50,
            height: 50,
            xOffset: 0,
            yOffset: 0,
            scalar: 0.1,
        }
    )

    // Parent is 2x wider and child is square.
    // We would need to scale the childBox to a minimum of 1000,
    // and since it's a square it woudl be 1000x1000.
    // scalar is 20 since 1000 / 50 = 20.
    parentBox = { width: 1000, height: 500 };
    childBox = { width: 50, height: 50 }
    t.deepEqual(
        mathf.calculateScalarToBackgroundCover(parentBox, childBox),
        {
            width: 1000,
            height: 1000,
            xOffset: 0,
            yOffset: 500,
            scalar: 20,
        }
    )

    // Parent is 2x wider and child is square but parent is smaller.
    // In order to cover the parent, the child would need to scale down to a
    // height of 50.  Making the height and width at 50.
    // scalar = 500 / 50 = 0.1
    // We if the parent width is 10 -> 50 - 10 = 40.  Then 40 / 2 = 20.  So
    // we need to shift it by 20 to center it.
    parentBox = { width: 10, height: 50 };
    childBox = { width: 500, height: 500 }
    t.deepEqual(
        mathf.calculateScalarToBackgroundCover(parentBox, childBox),
        {
            width: 50,
            height: 50,
            xOffset: 20,
            yOffset: 0,
            scalar: 0.1,
        }
    )

});
