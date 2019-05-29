
import { time } from './time';
import test from 'ava';

test('debounce', async t => {

    var count = 1;
    // Create a
    var debounce = time.debounce(() => {
        count++;
    }, 3);

    // Call debounce, sequentially.
    debounce();
    debounce();
    debounce();
    debounce();
    debounce();
    debounce();
    // Should still not be called yet.
    t.is(count, 1);


    // Wait to check debounce has been called.
    await time.wait(5);
    t.is(count, 2);

});

test('throttle', async t => {

    var count = 1;
    // Create a
    var throttle = time.throttle(() => {
        count++;
    }, 10);

    // Call throttle, sequentially.
    throttle();
    throttle();
    throttle();
    // Should have been called just once
    t.is(count, 2);


    await time.wait(100);
    throttle();
    t.is(count, 3);

});

test('waitUntil', async t => {

    let testValue = 0;
    let waitUntilCallbackCalled = false;

    // Set the interval to 1 for quick testing.
    time.waitUntil(() => testValue == 5, 0, 1).then(() => {
        waitUntilCallbackCalled = true;
    })
    t.is(waitUntilCallbackCalled, false);

    // Make it true in 10ms.
    setTimeout(() => {
        testValue = 5;
    }, 1)
    t.is(waitUntilCallbackCalled, false);

    // Now wait 15ms
    await time.wait(100);
    t.is(waitUntilCallbackCalled, true);

});