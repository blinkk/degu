import { mathf } from "./mathf";
import test from 'ava';


test("absZero", t => {
    t.is(mathf.absZero(-0), 0);
    t.is(mathf.absZero(0), 0);
    t.is(mathf.absZero(10), 10);
    t.is(mathf.absZero(-10), -10);
});

test("clampAsPercent", t => {
    t.is(mathf.clampAsPercent(-0), 0);
    t.is(mathf.clampAsPercent(-10), 0);
    t.is(mathf.clampAsPercent(0.1), 0.1);
    t.is(mathf.clampAsPercent(0.89), 0.89);
    t.is(mathf.clampAsPercent(1), 1);
    t.is(mathf.clampAsPercent(1000), 1);
});

test("clamp", t => {
    t.is(mathf.clamp(0, 10, 100), 10);
    t.is(mathf.clamp(0, 10, -100), 0);
    t.is(mathf.clamp(-10, 10, -100), -10);
    t.is(mathf.clamp(-10, 10, 100), 10);
});

test("round", t => {
    t.is(mathf.round(0.49999, 1), 0.5);
    t.is(mathf.round(0.49999, 2), 0.5);
    t.is(mathf.round(0.41199, 3), 0.412);
    t.is(mathf.round(0.4222222, 2), 0.42);
    t.is(mathf.round(0.48, 1), 0.5);
});

test("childProgress", t => {
    t.is(mathf.childProgress(0, 0.2, 0.6), 0);
    t.is(mathf.childProgress(0.2, 0.2, 0.6), 0);
    t.is(
        mathf.round(mathf.childProgress(0.3, 0.2, 0.6), 2)
        , 0.25);
    t.is(
        mathf.round(mathf.childProgress(0.3, 0.2, 0.6), 2)
        , 0.25);
    t.is(
        mathf.round(mathf.childProgress(0.4, 0.2, 0.6), 2)
        , 0.5);
    t.is(
        mathf.round(mathf.childProgress(0.5, 0.2, 0.6), 2)
        , 0.75);
    t.is(
        mathf.round(mathf.childProgress(0.6, 0.2, 0.6), 2)
        , 1);
    t.is(
        mathf.round(mathf.childProgress(0.7, 0.2, 0.6), 2)
        , 1);
});

test("lerp", t => {
    // Check basic lineaer interopolate.
    t.is(mathf.lerp(0, 1, 0), 0);
    t.is(mathf.lerp(0, 1, 0.2), 0.2);
    t.is(mathf.lerp(0, 1, 0.5), 0.5);
    t.is(mathf.lerp(0, 2, 0.5), 1);

    t.is(mathf.lerp(-25, 50, 0), -25);
    t.is(mathf.lerp(100, 10, 0), 100);
    t.is(mathf.lerp(0, 100, 0.5), 50);
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



test("getValueInRangeByProgress", t => {
    // Simple test.
    t.is(
        mathf.getValueInRangeByProgress(-10, 0, 10)
        , 0);
    t.is(
        mathf.getValueInRangeByProgress(0, 0, 10)
        , 0);
    t.is(
        mathf.getValueInRangeByProgress(0.2, 0, 10)
        , 2);
    t.is(
        mathf.getValueInRangeByProgress(0.5, 0, 10)
        , 5);
    t.is(
        mathf.getValueInRangeByProgress(1, 0, 10)
        , 10);
    t.is(
        mathf.getValueInRangeByProgress(10, 0, 10)
        , 10);

    // Shift
    t.is(
        mathf.getValueInRangeByProgress(0, 2, 12)
        , 2);
    t.is(
        mathf.getValueInRangeByProgress(0.2, 2, 12)
        , 4);
    t.is(
        mathf.getValueInRangeByProgress(0.5, 2, 12)
        , 7);
    t.is(
        mathf.getValueInRangeByProgress(1, 2, 12)
        , 12);
});


test("getProgressInRangeByValue", t => {
    // Simple test.
    t.is(
        mathf.getProgressInRangeByValue(0, 0, 10)
        , 0);
    // Out of range
    t.is(
        mathf.getProgressInRangeByValue(-10, 0, 10)
        , 0);
    t.is(
        mathf.getProgressInRangeByValue(2, 0, 10)
        , 0.2);
    t.is(
        mathf.getProgressInRangeByValue(5, 0, 10)
        , 0.5);
    t.is(
        mathf.getProgressInRangeByValue(10, 0, 10)
        , 1);
    // Out of range
    t.is(
        mathf.getProgressInRangeByValue(100, 0, 10)
        , 1);

    // Shift
    t.is(
        mathf.getProgressInRangeByValue(2, 2, 12)
        , 0);
    t.is(
        mathf.getProgressInRangeByValue(4, 2, 12)
        , 0.2);
    t.is(
        mathf.getProgressInRangeByValue(7, 2, 12)
        , 0.5);
    t.is(
        mathf.getProgressInRangeByValue(12, 2, 12)
        , 1);
});

test("calculateBackgroundCover", t => {

    // Simple scale up
    let parentBox = { width: 500, height: 500 };
    let childBox = { width: 50, height: 50 }
    t.deepEqual(
        mathf.calculateBackgroundCover(parentBox, childBox),
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
        mathf.calculateBackgroundCover(parentBox, childBox),
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
        mathf.calculateBackgroundCover(parentBox, childBox),
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
        mathf.calculateBackgroundCover(parentBox, childBox),
        {
            width: 50,
            height: 50,
            xOffset: 20,
            yOffset: 0,
            scalar: 0.1,
        }
    )

});
