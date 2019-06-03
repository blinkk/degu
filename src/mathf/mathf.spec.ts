import { mathf } from './mathf';
import { EASE } from '../ease/ease';
import test from 'ava';

test('absZero', t => {
    t.is(mathf.absZero(-0), 0);
    t.is(mathf.absZero(0), 0);
    t.is(mathf.absZero(10), 10);
    t.is(mathf.absZero(-10), -10);
});

test('clampAsPercent', t => {
    t.is(mathf.clampAsPercent(-0), 0);
    t.is(mathf.clampAsPercent(-10), 0);
    t.is(mathf.clampAsPercent(0.1), 0.1);
    t.is(mathf.clampAsPercent(0.89), 0.89);
    t.is(mathf.clampAsPercent(1), 1);
    t.is(mathf.clampAsPercent(1000), 1);
});

test('clamp', t => {
    t.is(mathf.clamp(0, 10, 100), 10);
    t.is(mathf.clamp(0, 10, -100), 0);
    t.is(mathf.clamp(-10, 10, -100), -10);
    t.is(mathf.clamp(-10, 10, 100), 10);
});

test('roundToPrecision', t => {
    t.is(mathf.roundToPrecision(0.49999, 1), 0.5);
    t.is(mathf.roundToPrecision(0.49999, 2), 0.5);
    t.is(mathf.roundToPrecision(0.41199, 3), 0.412);
    t.is(mathf.roundToPrecision(0.4222222, 2), 0.42);
    t.is(mathf.roundToPrecision(0.48, 1), 0.5);
    t.is(mathf.roundToPrecision(0.0004, 4), 0.0004);
    t.is(mathf.roundToPrecision(0.0004, 3), 0);
    t.is(mathf.roundToPrecision(0.5555, 3), 0.556);
    t.is(mathf.roundToPrecision(0.5555, 2), 0.56);
});

test('floorToPrecision', t => {
    t.is(mathf.floorToPrecision(0.5555, 3), 0.555);
    t.is(mathf.floorToPrecision(0.5555, 2), 0.55);
});

test('ceilToPrecision', t => {
    t.is(mathf.ceilToPrecision(0.11111, 3), 0.112);
    t.is(mathf.ceilToPrecision(0.11111, 2), 0.12);
});

test('childProgress', t => {
    t.is(mathf.childProgress(0, 0, 0.3), 0);
    t.is(mathf.childProgress(0.2, 0, 1), 0.2);
    t.is(mathf.childProgress(0, 0.2, 0.6), 0);
    t.is(mathf.childProgress(0.2, 0.2, 0.6), 0);
    t.is(
        mathf.roundToPrecision(mathf.childProgress(0.3, 0.2, 0.6), 2)
        , 0.25);
    t.is(
        mathf.roundToPrecision(mathf.childProgress(0.3, 0.2, 0.6), 2)
        , 0.25);
    t.is(
        mathf.roundToPrecision(mathf.childProgress(0.4, 0.2, 0.6), 2)
        , 0.5);
    t.is(
        mathf.roundToPrecision(mathf.childProgress(0.5, 0.2, 0.6), 2)
        , 0.75);
    t.is(
        mathf.roundToPrecision(mathf.childProgress(0.6, 0.2, 0.6), 2)
        , 1);
    t.is(
        mathf.roundToPrecision(mathf.childProgress(0.7, 0.2, 0.6), 2)
        , 1);
});

test('lerp', t => {
    // Check basic lineaer interopolate.
    t.is(mathf.lerp(0, 1, 0), 0);
    t.is(mathf.lerp(0, 1, 0.2), 0.2);
    t.is(mathf.lerp(0, 1, 0.5), 0.5);
    t.is(mathf.lerp(0, 2, 0.5), 1);

    t.is(mathf.lerp(-25, 50, 0), -25);
    t.is(mathf.lerp(100, 10, 0), 100);
    t.is(mathf.lerp(0, 100, 0.5), 50);
    t.is(mathf.lerp(25, 79, 0.2), 35.8);
});

test('smoothStep', t => {
    t.is(mathf.smoothStep(0, 10, 0), 0);
    t.is(mathf.smoothStep(100, 200, 150), 0.5);
    t.is(mathf.smoothStep(10, 20, 40), 1);
    t.is(mathf.smoothStep(10, 20, 15), 0.5);
    t.is(mathf.smoothStep(10, 30, 9), 0);
});

test('lerpEase', t => {
    // Check ease interopolate.
    let ease = EASE.easeInExpo;
    t.is(mathf.lerpEase(0, 1, 0, ease), 0);
    t.is(mathf.lerpEase(0, 1, 0.1, ease), 0.001953125);
    t.is(mathf.lerpEase(0, 1, 0.2, ease), 0.00390625);
    t.is(mathf.lerpEase(0, 1, 0.3, ease), 0.0078125);
    t.is(mathf.lerpEase(0, 1, 0.5, ease), 0.03125);
    t.is(mathf.lerpEase(0, 1, 0.9, ease), 0.5000000000000001);
    t.is(mathf.lerpEase(0, 1, 0.95, ease), 0.7071067811865474);
    t.is(mathf.lerpEase(0, 1, 1, ease), 1);

    ease = EASE.easeInOutSine;
    t.is(mathf.lerpEase(0, 1, 0, ease), 0);
    t.is(mathf.lerpEase(0, 1, 0.5, ease), 0.49999999999999994);
    t.is(mathf.lerpEase(0, 1, 1, ease), 1);

    ease = EASE.easeInBounce;
    t.is(mathf.lerpEase(0, 1, 0, ease), 0);
    t.is(mathf.lerpEase(0, 1, 0.5, ease), 0.234375);
    t.is(mathf.lerpEase(0, 1, 1, ease), 1);

    ease = EASE.easeInOutElastic;
    t.is(mathf.lerpEase(0, 1, 0, ease), 0);
    t.is(mathf.lerpEase(0, 1, 0.5, ease), 0.5);
    t.is(mathf.lerpEase(0, 1, 1, ease), 1);

    ease = EASE.linear;
    t.is(mathf.lerpEase(0, 1, 0, ease), 0);
    t.is(mathf.lerpEase(0, 1, 0.1, ease), 0.1);
    t.is(mathf.lerpEase(0, 1, 0.2, ease), 0.2);
    t.is(mathf.lerpEase(0, 1, 0.3, ease), 0.3);
    t.is(mathf.lerpEase(0, 1, 0.4, ease), 0.4);
    t.is(mathf.lerpEase(0, 1, 0.5, ease), 0.5);
    t.is(mathf.lerpEase(0, 1, 0.6, ease), 0.6);
    t.is(mathf.lerpEase(0, 1, 0.7, ease), 0.7);
    t.is(mathf.lerpEase(0, 1, 0.8, ease), 0.8);
    t.is(mathf.lerpEase(0, 1, 0.9, ease), 0.9);
    t.is(mathf.lerpEase(0, 1, 1, ease), 1);


    // Test lerp ease without an ease function (should default to linear)
    t.is(mathf.lerpEase(0, 1, 0), 0);
    t.is(mathf.lerpEase(0, 1, 0.1), 0.1);
    t.is(mathf.lerpEase(0, 1, 0.2), 0.2);
    t.is(mathf.lerpEase(0, 1, 0.3), 0.3);
    t.is(mathf.lerpEase(0, 1, 0.4), 0.4);
    t.is(mathf.lerpEase(0, 1, 0.5), 0.5);
    t.is(mathf.lerpEase(0, 1, 0.6), 0.6);
    t.is(mathf.lerpEase(0, 1, 0.7), 0.7);
    t.is(mathf.lerpEase(0, 1, 0.8), 0.8);
    t.is(mathf.lerpEase(0, 1, 0.9), 0.9);
    t.is(mathf.lerpEase(0, 1, 1), 1);
});
test('ease', t => {
    let ease = EASE.easeInOutSine;
    t.is(mathf.ease(0, 1, 0, ease), 0);
    t.is(mathf.ease(0, 1, 0.5, ease), 0.49999999999999994);
    t.is(mathf.ease(0, 1, 1, ease), 1);

    ease = EASE.easeInBounce;
    t.is(mathf.ease(0, 1, 0, ease), 0);
    t.is(mathf.ease(0, 1, 0.5, ease), 0.234375);
    t.is(mathf.ease(0, 1, 1, ease), 1);

    ease = EASE.easeInOutElastic;
    t.is(mathf.ease(0, 1, 0, ease), 0);
    t.is(mathf.ease(0, 1, 0.5, ease), 0.5);
    t.is(mathf.ease(0, 1, 1, ease), 1);


});



test('interpolateRange', t => {
    t.is(
        mathf.interpolateRange(0, 0, 100, 0, 200),
        0
    )
    t.is(
        mathf.interpolateRange(50, 0, 100, 0, 200),
        100
    )
    t.is(
        mathf.interpolateRange(30, 0, 100, 0, 200),
        60
    )
    t.is(
        mathf.int(mathf.interpolateRange(30, 10, 120, 800, 1000)),
        855
    )
});

test('fixDigits', t => {
    t.is(mathf.fixDigits(20.12345, 0), 20);
    t.is(mathf.fixDigits(20.12345, 1), 20.1);
    t.is(mathf.fixDigits(20.12345, 2), 20.12);
    t.is(mathf.fixDigits(20.12345, 4), 20.1234);
});

test('getDirection', t => {
    t.is(mathf.direction(1, 2), 1);
    t.is(mathf.direction(3, 1), -1);
    t.is(mathf.direction(1, 1), 0);
});

test('int', t => {
    t.is(mathf.int(20.311), 20);
    t.is(mathf.int(20.32), 20);
    t.is(mathf.int(20), 20);
});

test('calculateCenterOffset', t => {
    t.is(mathf.calculateCenterOffset(8, 5), 1.5);
    t.is(mathf.calculateCenterOffset(10, 5), 2.5);
});

test('angleDistanceDegree', t => {

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

test('scaleY1', t => {
    t.is(
        mathf.scaleY1(5, 10, 20),
        10);
    t.is(
        mathf.scaleY1(2, 10, 20),
        4);
});

test('scaleY2', t => {
    t.is(
        mathf.scaleY2(5, 10, 3),
        6);
    t.is(
        mathf.scaleY2(2, 10, 20),
        100);
});

test('aspectRatio', t => {
    t.is(mathf.aspectRatio({ width: 500, height: 500 }), 1);
    t.is(mathf.aspectRatio({ width: 1000, height: 500 }), 2);
    t.is(
        mathf.fixDigits(mathf.aspectRatio({ width: 1600, height: 1080 }), 2),
        mathf.fixDigits(1.48, 2));
});


test('isBetween', t => {
    t.is(mathf.isBetween(1, 0, 5), true);
    t.is(mathf.isBetween(1, 2, 1), true);
    t.is(mathf.isBetween(1, 2, 5), false);
    t.is(mathf.isBetween(2, 2, 5), true);
    // Inclusive option
    t.is(mathf.isBetween(2, 2, 5, false), false);
    t.is(mathf.isBetween(2.1, 2, 5, false), true);
});


test('wrap', t => {
    t.is(mathf.wrap(15, 0, 10), 5);
    t.is(mathf.wrap(400, 0, 360), 40);
    t.is(mathf.wrap(120, -90, 90), -60);
});


test('resizedimensionalBoxToWidth', t => {
    t.deepEqual(
        mathf.resizedimensionalBoxToWidth({ width: 500, height: 500 }, 250),
        { width: 250, height: 250 });
    t.deepEqual(
        mathf.resizedimensionalBoxToWidth({ width: 250, height: 500 }, 800),
        { width: 800, height: 1600 });
    t.deepEqual(
        mathf.resizedimensionalBoxToWidth({ width: 10, height: 12 }, 800),
        { width: 800, height: 960 });
});

test('resizedimensionalBoxToHeight', t => {
    t.deepEqual(
        mathf.resizedimensionalBoxToHeight({ width: 500, height: 500 }, 250),
        { width: 250, height: 250 });
    t.deepEqual(
        mathf.resizedimensionalBoxToHeight({ width: 250, height: 500 }, 800),
        { width: 400, height: 800 });
    t.deepEqual(
        mathf.resizedimensionalBoxToHeight({ width: 10, height: 16 }, 800),
        { width: 500, height: 800 });
});

test('getValueInRangeByProgress', t => {
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

test('getProgressInRangeByValue', t => {
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

test('calculateBackgroundCover', t => {
    // Simple scale up
    let parentBox = { width: 500, height: 500 };
    let childBox = { width: 50, height: 50 };
    t.deepEqual(
        mathf.calculateBackgroundCover(parentBox, childBox),
        {
            width: 500,
            height: 500,
            xOffset: 0,
            yOffset: 0,
            scalar: 10
        }
    );

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
            scalar: 0.1
        }
    );

    // Parent is 2x wider and child is square.
    // We would need to scale the childBox to a minimum of 1000,
    // and since it's a square it woudl be 1000x1000.
    // scalar is 20 since 1000 / 50 = 20.
    parentBox = { width: 1000, height: 500 };
    childBox = { width: 50, height: 50 };
    t.deepEqual(
        mathf.calculateBackgroundCover(parentBox, childBox),
        {
            width: 1000,
            height: 1000,
            xOffset: 0,
            yOffset: 500,
            scalar: 20
        }
    );

    // Parent is 2x wider and child is square but parent is smaller.
    // In order to cover the parent, the child would need to scale down to a
    // height of 50.  Making the height and width at 50.
    // scalar = 500 / 50 = 0.1
    // We if the parent width is 10 -> 50 - 10 = 40.  Then 40 / 2 = 20.  So
    // we need to shift it by 20 to center it.
    parentBox = { width: 10, height: 50 };
    childBox = { width: 500, height: 500 };
    t.deepEqual(
        mathf.calculateBackgroundCover(parentBox, childBox),
        {
            width: 50,
            height: 50,
            xOffset: 20,
            yOffset: 0,
            scalar: 0.1
        }
    );

});
