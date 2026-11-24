import * as is from '../is/is';
import {test} from '../testing/test-helpers';
import {Raf} from './raf';

test('Raf Progress is defined', (t) => {
  t.is(is.defined(Raf), true);
});

test('raf.read and raf.write return Promises resolving callback return values', async (t) => {
  const raf = new Raf();
  const order: string[] = [];

  const readPromise = raf.read(() => {
    order.push('read');
    return 42;
  });
  const writePromise = raf.write(() => {
    order.push('write');
    return 'done';
  });

  const [readVal, writeVal] = await Promise.all([readPromise, writePromise]);
  t.is(readVal, 42);
  t.is(writeVal, 'done');
  t.deepEqual(order, ['read', 'write']);

  raf.dispose();
});
