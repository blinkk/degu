import { MultiInterpolate, multiInterpolateHelper } from './multi-interpolate';
import { mathf } from '../mathf/mathf';
import { EASE } from '../ease/ease';
import test from 'ava';
import { time } from '../time/time';

test('Check Invalid Ranged progresses', t => {
    // Check from and to equality.
    let error = t.throws(() => {
        multiInterpolateHelper.checkInvalidRangedProgresses([
            { from: 0.2, to: 0.2, start: 0, end: 0 }
        ])
    })
    t.is(error.message, multiInterpolateHelper.errors.FROM_TO_EQUAL);

    // Check from greater than to.
    error = t.throws(() => {
        multiInterpolateHelper.checkInvalidRangedProgresses([
            { from: 0.5, to: 0.2, start: 0, end: 0 }
        ])
    })
    t.is(error.message, multiInterpolateHelper.errors.FROM_GREATER);
})

test('FindBestMatchingRangedProgress', t => {
    let progressSet = [
        { from: 0.1, to: 0.4, start: 0, end: 0 },
        { from: 0.4, to: 0.5, start: 0, end: 0 },
        // Create a gap between 0.5 and 0.7.
        // In this case, at 0.6, index 1 should be used.
        { from: 0.7, to: 0.8, start: 0, end: 0 },
        { from: 0.8, to: 0.9, start: 0, end: 0 },
    ]

    // Checkes what index of the progress set we should be on at x progress.
    let checkPositionAt = (progress: number, index: number) => {
        // Run the findBestMatchingrangedProgress algo.
        let run = multiInterpolateHelper.findBestMatchingRangedProgress(
            progress, progressSet)
        // Check the retuned value to make sure it is at a provided index.
        t.deepEqual(run, progressSet[index]);
    }

    checkPositionAt(0, 0);
    checkPositionAt(0.1, 0);
    checkPositionAt(0.2, 0);
    checkPositionAt(0.3, 0);
    checkPositionAt(0.39, 0);
    checkPositionAt(0.4, 1);
    checkPositionAt(0.45, 1);
    checkPositionAt(0.49, 1);
    checkPositionAt(0.5, 1);
    checkPositionAt(0.6, 1);
    checkPositionAt(0.7, 2);
    checkPositionAt(0.75, 2);
    checkPositionAt(0.8, 3);
    checkPositionAt(0.9, 3);
    checkPositionAt(1, 3);


});

test('Basic Multi Interpolation (linear)', t => {
    let inter = new MultiInterpolate({
        interpolations: [
            {
                id: 'x',
                progress: [
                    { from: 0, to: 1, start: 0, end: 100 },
                ]
            },
            {
                id: 'y',
                progress: [
                    { from: 0, to: 1, start: 0, end: 1000 },
                ]
            }
        ]
    })


    t.deepEqual(inter.calculate(0), { x: 0, y: 0 });
    t.deepEqual(inter.calculate(0.1), { x: 10, y: 100 });
    t.deepEqual(inter.calculate(0.2), { x: 20, y: 200 });
    t.deepEqual(inter.calculate(0.3), { x: 30, y: 300 });
    t.deepEqual(inter.calculate(0.4), { x: 40, y: 400 });
    t.deepEqual(inter.calculate(0.5), { x: 50, y: 500 });
    t.deepEqual(inter.calculate(0.8), { x: 80, y: 800 });
    t.deepEqual(inter.calculate(1), { x: 100, y: 1000 });
})

test('Basic Multi Interpolation (multi progress)', t => {
    let inter = new MultiInterpolate({
        interpolations: [
            {
                id: 'x',
                progress: [
                    { from: 0, to: 0.5, start: 0, end: 100 },
                    { from: 0.5, to: 1, start: 100, end: 200 },
                ]
            },
        ]
    })


    t.deepEqual(inter.calculate(0), { x: 0 });
    t.deepEqual(inter.calculate(0.25), { x: 50 });
    t.deepEqual(inter.calculate(0.5), { x: 100 });
    t.deepEqual(inter.calculate(0.75), { x: 150 });
    t.deepEqual(inter.calculate(1), { x: 200 });
})

test('Basic Multi Interpolation (mid progress)', t => {
    let inter = new MultiInterpolate({
        interpolations: [
            {
                id: 'x',
                progress: [
                    { from: 0.1, to: 0.2, start: 10, end: 110 },
                ]
            },
        ]
    })


    t.deepEqual(inter.calculate(0), { x: 10 });
    t.deepEqual(inter.calculate(0.1), { x: 10 });
    t.is(Math.round(inter.calculate(0.15)['x']), Math.round(60));
    t.deepEqual(inter.calculate(0.2), { x: 110 });
    t.deepEqual(inter.calculate(0.3), { x: 110 });
    t.deepEqual(inter.calculate(1), { x: 110 });
})

test('Multi Interpolation (non linear ease)', t => {
    let inter = new MultiInterpolate({
        interpolations: [
            {
                id: 'x',
                progress: [
                    { from: 0, to: 1, start: 0, end: 1000, easingFunction: EASE.easeOutSine },
                ]
            },
        ]
    })

    t.is(Math.round(inter.calculate(0)['x']), Math.round(0));
    t.is(Math.round(inter.calculate(0.1)['x']), Math.round(156));
    t.is(Math.round(inter.calculate(0.2)['x']), Math.round(309));
    t.is(Math.round(inter.calculate(0.3)['x']), Math.round(454));
    t.is(Math.round(inter.calculate(0.4)['x']), Math.round(588));
    t.is(Math.round(inter.calculate(0.8)['x']), Math.round(951));
    t.is(Math.round(inter.calculate(0.9)['x']), Math.round(988));
    t.is(Math.round(inter.calculate(1)['x']), Math.round(1000));
})

test('Multi Interpolation Complex', t => {
    let inter = new MultiInterpolate({
        interpolations: [
            {
                progress: [
                    {
                        from: 0.3, to: 0.5, start: 50, end: 1000,
                        easingFunction: EASE.easeInOutSine
                    },
                    {
                        from: 0.5, to: 0.8, start: 1000, end: 8000,
                        easingFunction: EASE.easeInOutBounce
                    }
                ],
                id: 'x',
            },
            {
                progress: [{ from: 0, to: 0.5, start: 0, end: 100 }],
                id: 'y',
            },
            {
                progress: [{ from: 0, to: 1, start: 0, end: 100 }],
                id: 'z',
            }
        ]
    })


    // 0%
    t.is(Math.round(+inter.calculate(0)['x']), Math.round(50));
    t.is(Math.round(+inter.calculate(0)['y']), Math.round(0));
    t.is(Math.round(+inter.calculate(0)['z']), Math.round(0));

    // 30%
    t.is(Math.round(+inter.calculate(0.3)['x']), Math.round(50));
    t.is(Math.round(+inter.calculate(0.3)['y']), Math.round(60));
    t.is(Math.round(+inter.calculate(0.3)['z']), Math.round(30));

    // 70%
    t.is(Math.round(+inter.calculate(0.7)['x']), Math.round(7441));
    t.is(Math.round(+inter.calculate(0.7)['y']), Math.round(100));
    t.is(Math.round(+inter.calculate(0.7)['z']), Math.round(70));

    // 100%
    t.is(Math.round(+inter.calculate(1)['x']), Math.round(8000));
    t.is(Math.round(+inter.calculate(1)['y']), Math.round(100));
    t.is(Math.round(+inter.calculate(1)['z']), Math.round(100));
})