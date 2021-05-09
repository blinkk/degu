
import { Stream } from './stream';
import test from 'ava';


/**
 * @hidden
 */
class TestStream extends Stream {
    public name: string;
    public lastname: string;
    public nickname: string;
    public age: number;
    public location: string;

    constructor() {
        super();

        this.name = 'John';
        this.lastname = 'Smith';
        this.nickname = 'John';
        this.age = 23;
        this.location = 'US';

        this.markObservable('name');
        this.markObservable('lastname');
        this.markObservable('nickname');
        this.markObservable('age');
    }

    getAge() {
        return this.name + ' ' + this.lastname;
    }

}




test('stream run reacts to changes', async t => {
    let testStream = new TestStream();

    var count = 0;
    // Update count each time a change is detected.
    testStream.change(() => {
        count++;
    })

    t.is(count, 0);

    t.is(testStream.name, 'John');
    t.is(testStream.age, 23);

    testStream.name = "Riki";
    t.is(count, 1);
    testStream.age = 24;
    t.is(count, 2);
    testStream.age = 24;
    testStream.age = 25;
    t.is(count, 4);
    testStream.location = 'suppy';
    t.is(count, 4);
})


test('stream run reacts to watches', async t => {
    let testStream = new TestStream();

    var nameCount = 0;
    testStream.watch('name', () => {
        nameCount++;
    })

    var ageCount = 0;
    testStream.watch('age', () => {
        ageCount++;
    })

    var count = 0;
    testStream.change(() => {
        count++;
    })

    t.is(count, 0);
    t.is(nameCount, 0);
    t.is(ageCount, 0);

    t.is(testStream.name, 'John');
    t.is(testStream.age, 23);

    testStream.name = "Riki";
    testStream.age = 24;
    t.is(testStream.name, 'Riki');
    t.is(testStream.age, 24);
    t.is(nameCount, 1);
    t.is(ageCount, 1);
    t.is(count, 2);

    testStream.age = 72;
    t.is(ageCount, 2);
    t.is(count, 3);

})


test('stream freeze / unfreeze', async t => {
    let testStream = new TestStream();

    var nameCount = 0;
    testStream.watch('name', () => {
        nameCount++;
    })
    var ageCount = 0;
    testStream.watch('age', () => {
        ageCount++;
    })

    var count = 0;
    testStream.change(() => {
        count++;
    })
    t.is(nameCount, 0);
    t.is(ageCount, 0);
    t.is(count, 0);


    // Now freeze it and make some changes.
    testStream.freeze();
    testStream.name = "Riki";
    testStream.name = "Santa";

    // There should be no changes.
    t.is(nameCount, 0);
    t.is(ageCount, 0);
    t.is(count, 0);
    t.is(testStream.isFrozen, true);

    // Now unfreeze it at which point name and change should get called.
    testStream.unfreeze();
    t.is(nameCount, 1);
    t.is(ageCount, 0);
    t.is(count, 1);

    // refreeze it.
    testStream.freeze();
    testStream.name = "Riki";
    testStream.name = "Santa";
    testStream.age = 23;
    testStream.age = 82;
    testStream.unfreeze();
    t.is(nameCount, 2);
    t.is(ageCount, 1);
    t.is(count, 2);
})

test('stream update', async t => {

    let testStream = new TestStream();

    var nameCount = 0;
    testStream.watch('name', () => {
        nameCount++;
    })
    var ageCount = 0;
    testStream.watch('age', () => {
        ageCount++;
    })

    var count = 0;
    testStream.change(() => {
        count++;
    })
    t.is(nameCount, 0);
    t.is(ageCount, 0);
    t.is(count, 0);


    testStream.update({
        name: 'Haruto',
        age: 84
    })
    t.is(testStream.name, 'Haruto');
    t.is(testStream.age, 84);
    t.is(nameCount, 1);
    t.is(ageCount, 1);
    t.is(count, 1);
});