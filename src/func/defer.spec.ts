import {Defer} from './defer';
import test from 'ava';

test('defer', async t => {
  const defer = new Defer();

  let count = 0;
  const resolveLater = () => {
    window.setTimeout(() => {
      count++;
      defer.resolve();
    });
  };
  t.is(count, 0);
  resolveLater();
  await defer.getPromise();
  t.is(count, 1);
});
