import {Timer} from './timer';
import * as is from '../is/is';
import test from 'ava';

test('time is defined', t => {
  t.is(is.defined(Timer), true);
});

test('timer is called once after a set duration', async t => {
  let count = 0;
  const increment = () => {
    count++;
  };

  const timer = new Timer({
    duration: 1,
    repeat: false,
  });
  timer.on(Timer.Event.END, () => {
    increment();
  });

  timer.start();

  await new Promise(r => setTimeout(r, 10));
  t.is(count, 1);
});

test('timer is called multiple time after a set duration in repeat mode', async t => {
  let count = 0;
  const increment = () => {
    count++;
  };

  const timer = new Timer({
    duration: 20,
    repeat: true,
  });
  timer.on(Timer.Event.END, () => {
    increment();
  });

  timer.start();

  await new Promise(r => setTimeout(r, 50));
  t.is(count, 2);
});

test('timer can be paused and unpaused', async t => {
  let count = 0;
  const increment = () => {
    count++;
  };

  const timer = new Timer({
    duration: 10,
    repeat: false,
  });
  timer.on(Timer.Event.END, () => {
    increment();
  });

  timer.start();

  // Immediately pause it
  timer.pause();
  await new Promise(r => setTimeout(r, 20));
  t.is(count, 0);

  timer.unpause();
  t.is(count, 0);

  await new Promise(r => setTimeout(r, 20));
  t.is(count, 1);
});
