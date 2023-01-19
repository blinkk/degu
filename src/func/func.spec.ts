import * as func from './func';
import test from 'ava';

test('debounce', async t => {
  let count = 1;
  // Create a
  const debounce = func.debounce(() => {
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
  await func.wait(5);
  t.is(count, 2);
});

test('throttle', async t => {
  let count = 1;
  // Create a
  const throttle = func.throttle(() => {
    count++;
  }, 10);

  // Call throttle, sequentially.
  throttle();
  throttle();
  throttle();
  // Should have been called just once
  t.is(count, 2);

  await func.wait(100);
  throttle();
  t.is(count, 3);
});

test('runOnlyOnce', async t => {
  let count = 0;
  // Create a
  const test = func.runOnlyOnce(() => {
    count++;
  });

  test();
  test();
  test();
  // Should have been called just once
  t.is(count, 1);
});

test('waitUntil', async t => {
  let testValue = 0;
  let waitUntilCallbackCalled = false;

  // Set the interval to 1 for quick testing.
  func
    .waitUntil(() => testValue === 5, 0, 1)
    .then(() => {
      waitUntilCallbackCalled = true;
    });
  t.is(waitUntilCallbackCalled, false);

  // Make it true in 10ms.
  setTimeout(() => {
    testValue = 5;
  }, 1);
  t.is(waitUntilCallbackCalled, false);

  // Now wait 15ms
  await func.wait(100);
  t.is(waitUntilCallbackCalled, true);
});

test('memoize', async t => {
  // Number of times memoize function is run.
  let count = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const run = func.memoize((value: any) => {
    count++;
    return value;
  });
  t.is(count, 0);

  t.is(run(5), 5);
  t.is(count, 1);
  // Run 2 several times.
  t.is(run(6), 6);
  t.is(count, 2);

  // Now rerun the executions
  t.is(run(5), 5);
  t.is(run(5), 5);
  t.is(run(5), 5);
  t.is(run(5), 5);
  t.is(run(5), 5);
  t.is(run(6), 6);
  t.is(run(6), 6);
  t.is(run(6), 6);

  // The count should still remain at 2.
  t.is(count, 2);
});

test('memoizeSimple', async t => {
  // Number of times memoize function is run.
  let count = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const run = func.memoizeSimple((value: any) => {
    count++;
    return value;
  });
  t.is(count, 0);

  t.is(run(5), 5);
  t.is(run(5), 5);
  t.is(run(5), 5);
  t.is(run(5), 5);
  t.is(run(5), 5);
  t.is(count, 1);
  // Run 2 several times.
  t.is(run(6), 6);
  t.is(run(6), 6);
  t.is(run(6), 6);
  t.is(run(6), 6);
  t.is(count, 2);

  // Now rerun the executions.  Since simple has a simple memory,
  // it should rerun.
  t.is(run(5), 5);
  t.is(count, 3);
  t.is(run(5), 5);
  t.is(count, 3);
  t.is(run(6), 6);
  t.is(count, 4);
  t.is(run(6), 6);
  t.is(count, 4);
  t.is(run(7), 7);
  t.is(count, 5);
});

test('runOnceOnChange', async t => {
  // Number of times memoize function is run.
  let count = 0;

  const run = func.memoizeSimple(() => {
    count++;
  });
  t.is(count, 0);

  run(1);
  run(1);
  run(1);
  run(1);
  run(1);
  t.is(count, 1);
  run(2);
  t.is(count, 2);
  run(1);
  t.is(count, 3);
  run(2);
  run(2);
  run(2);
  t.is(count, 4);
});

test('setDefault', async t => {
  let test = func.setDefault(false, false);
  t.is(test, false);
  test = func.setDefault(undefined, 4);
  t.is(test, 4);
  test = func.setDefault(undefined, 0);
  t.is(test, 0);
  test = func.setDefault(0, 1);
  t.is(test, 0);
});
