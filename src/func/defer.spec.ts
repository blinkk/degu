import { Defer } from './defer';
import test from 'ava';



test('defer', async t => {

    let defer = new Defer();

    let count = 0;
    let resolveLater = () => {
        window.setTimeout(() => {
            count++;
            defer.resolve();
        })
    }
    t.is(count, 0);
    resolveLater();
    await defer.getPromise();
    t.is(count, 1);

});