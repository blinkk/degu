
import { time } from './time';
import test from 'ava';

async function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
}

test('debounce', async t => {

    var count = 1;
    // Create a
    var debounce = time.debounce(() => {
        count++;
    }, 10);

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
    await delay(100);
    // t.is(count, 5);

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


    // Wait to check
    await delay(100);
    throttle();
    t.is(count, 3);

});