import { mathf } from "./mathf";
import test from 'ava';



test("fixDigits", t => {
    t.is(mathf.fixDigits(20.12345, 0), 20);
    t.is(mathf.fixDigits(20.12345, 1), 20.1);
    t.is(mathf.fixDigits(20.12345, 2), 20.12);
    t.is(mathf.fixDigits(20.12345, 4), 20.1234);
});

test("int", t => {
    t.is(mathf.int(20.311), 20);
    t.is(mathf.int(20.32), 20);
    t.is(mathf.int(20), 20);
});


test("calculateCenterOffset", t => {
    t.is(mathf.calculateCenterOffset(8, 5), 1.5);
    t.is(mathf.calculateCenterOffset(10, 5), 2.5);
});

test("angleDistanceDegree", t => {

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


