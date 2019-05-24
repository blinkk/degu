import { mathf } from "./mathf";
import test from 'ava';


test('foo', t => {
    t.pass();
});

test('bar', async t => {
    const bar = Promise.resolve('bar');
    t.is(await bar, 'bar');
});

// describe("mathf", () => {
//     describe("fixDigits", () => {
//         it("should fix the number of digits in a number", () => {
//             expect(mathf.fixDigits(20.12345, 0)).toEqual(20);
//             expect(mathf.fixDigits(20.12345, 1)).toEqual(20.1);
//             expect(mathf.fixDigits(20.12345, 2)).toEqual(20.12);
//             expect(mathf.fixDigits(20.12345, 4)).toEqual(20.1234);
//         });
//     });

//     describe("int", () => {
//         it("should convert a float to an int", () => {
//             expect(mathf.int(20.311)).toEqual(20);
//             expect(mathf.int(20.32)).toEqual(20);
//             expect(mathf.int(20)).toEqual(20);
//         });
//     });


//     describe("calculateCenterOffset", () => {
//         it("should return offset values", () => {
//             expect(mathf.calculateCenterOffset(8, 5)).toEqual(1.5);
//             expect(mathf.calculateCenterOffset(10, 5)).toEqual(2.5);
//         });
//     });

//     describe("angleDistanceDegree", () => {
//         it("should calculate the distance between two angles", () => {

//             expect(mathf.angleDistanceDegree(10, 10)).toEqual(0);
//             expect(
//                 mathf.int(mathf.angleDistanceDegree(30, 10))
//             ).toEqual(-20);
//             expect(
//                 mathf.int(mathf.angleDistanceDegree(10, 50))
//             ).toEqual(40);
//             expect(
//                 mathf.int(mathf.angleDistanceDegree(180, 10))
//             ).toEqual(-170);
//             expect(
//                 mathf.int(mathf.angleDistanceDegree(10, 340))
//             ).toEqual(-30);
//         });
//     });

// });

