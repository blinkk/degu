import { Vector2 } from "./vector2";

describe("Vector2", () => {
  it("sums two numbers", () => {
    let test = new Vector2();
    expect(test.getX(0)).toEqual(0);
  });

  it("hello", () => {
    let test = new Vector2();
    expect(test.hello()).toEqual('hello3');
  });

});

