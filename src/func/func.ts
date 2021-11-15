import * as time from '../time/time';

/**
 *  A basic debounce implementation.  Debounce will basically wait X amount
 * of seconds to execute AFTER it's last call.
 *
 * ```ts
 *
 * const debouncer = func.debounce((windowEvent)=> {
 *   console.log(wiindowEvent);
 * }, 500);
 *
 * // Now when you resize, it will wait 500 ms until the last resize call.
 * window.addEventListener('resize', debounce);
 *
 * Or
 *
 * window.addEventListener('resize', func.debounce(()=> {
 *   console.log('throttled');
 * }, 500))
 *
 * ```
 *
 * @param callback The function to call.
 * @param wait The ms to delay.
 * @param immediate Optional, whether to immediately run (changes this to throttle)
 * @return A debounced function
 * @tested
 */
export function debounce(
  callback: Function,
  wait: number,
  immediate?: boolean
): () => void {
  let timeOutId: undefined | number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (this: any, ...args: any[]) {
    // eslint-disable-next-line
    const ctx: any = this;
    const runLater = () => {
      timeOutId = undefined;
      callback.apply(ctx, args);
    };
    const throttler = () => {
      timeOutId = undefined;
    };

    // Debouncing should reset the timer if it is called again.
    if (!immediate) {
      clearTimeout(timeOutId);
      timeOutId = +setTimeout(runLater, wait);
    }

    // For throttling where we call on leading trail (immediate).
    if (immediate && timeOutId === undefined) {
      callback.apply(ctx, args);
      timeOutId = +setTimeout(throttler, wait);
    }
  };
}

/**
 * Throttles a function.  Throttle will run a function immediately when it's
 * called and wait X amount of seconds before it can be called again.
 *
 * ```ts
 *
 * const throttler = func.throttle((windowEvent)=> {
 *   console.log(wiindowEvent);
 * }, 500);
 *
 * // Now when you resize, it will immediately call the throttle function
 * // and wait 500 ms before it can be called again.
 * window.addEventListener('resize', throttler);
 *
 * Or just:
 *
 * window.addEventListener('resize', func.throttle(()=> {
 *   console.log('throttled');
 * }, 500))
 *
 * ```
 *
 * @param callback The callback function
 * @param wait The amount to wait in ms.
 * @tested
 */
export function throttle(callback: Function, wait: number): () => void {
  return func.debounce(callback, wait, true);
}

/**
 * A simple function that resolves after a specific amoutn of time.
 * This is useful to create a delay with await.
 * ```ts
 * console.log('hohoho');
 * await func.wait(500);
 * console.log('hohoho after 500ms');
 * ```
 * @param time
 * @tested
 */
export async function wait(time: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, time));
}

/**
 * Wait until a condition becomes truthy.   This under the hood implements
 * polling to evaluate the condition so use wisely.
 *
 * ```ts
 *
 * let someValue = 0;
 * func.waitUntil(()=> someValue === 5).then(()=> {
 *   console.log('some value is 5!!!');
 * })
 *
 * setTimeout(()=> {
 *   someValue = 5;
 * }, 1000);
 *
 * ```
 *
 *
 * @param {Function} A condition that returns a boolean.
 * @param {number} The amount of time that can elapse before rejecting the
 *     returning promise. Defaults to 0, which is evaluated as forever.
 * @param {number} The polling interval amount.
 * @tested
 */
export function waitUntil(
  condition: Function,
  timeout = 0,
  interval = 100
): Promise<void> {
  const startTime = time.now();
  let resolvePromise: Function;
  let rejectPromise: Function;
  const returnPromise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  const evaluateCondition = () => {
    const elapsed = time.timeDiffMs(startTime, time.now());
    // If the condition resolves.
    if (condition()) {
      resolvePromise();
    } else if (timeout && elapsed > timeout) {
      rejectPromise('Wait until timed out');
    } else {
      setTimeout(evaluateCondition, interval);
    }
  };
  // Start it up.
  evaluateCondition();

  return returnPromise;
}

/**
 * Similar to waitUntil but will repeatedly perform an
 * action until a condition is met.
 * @param condition
 * @param action
 * @param timeout
 * @param interval
 *
 *
 * ```
 * let someValue = 0;
 * func.repeatUntil(
 *  ()=> {return someValue === 5},
 *  ()=> { somevalue++; }
 * ).then(()=> {
 *   console.log('some value is 5!!!');
 * })
 * ```
 */
export function repeatUntil(
  condition: Function,
  // The action that should be performed
  action: Function,
  timeout = 0,
  interval = 100
): Promise<void> {
  const startTime = time.now();
  let resolvePromise: Function;
  let rejectPromise: Function;
  const returnPromise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  const evaluateCondition = () => {
    const elapsed = time.timeDiffMs(startTime, time.now());
    // If the condition resolves.
    if (condition()) {
      resolvePromise();
    } else if (timeout && elapsed > timeout) {
      rejectPromise('Wait until timed out');
    } else {
      action();
      setTimeout(evaluateCondition, interval);
    }
  };
  // Start it up.
  evaluateCondition();

  return returnPromise;
}

/**
 * Memoizes a function with just a one time memory.   This memoize
 * conserves RAM (probably :))
 *
 * If the same parameter is passed as the last execution, the results are
 * pulled from the cache.  When paramers change, the callback is reevaluated
 * for new results.
 *
 * The key difference between [[func.memoize]] is that this memoize stores
 * just the last results as opposed to a dictionary of all previous results.
 *
 * If running a lot of executions, this can save memory.
 *
 * Consider the following example.  The calculations are done only when
 * a mutation occurs in the parameters.  Otherwise, the results are
 * pull from the single cache.
 *
 * ```ts
 * let expensiveCalculation = func.memoizeSimple((a,b,c)=> {
 *   return a + b + c;
 * })
 *
 * expensiveCalculation(1, 1, 1); // 3, callback executed and results cached.
 * expensiveCalculation(1, 1, 1); // 3 from cache
 * expensiveCalculation(1, 1, 1); // 3 from cache
 * expensiveCalculation(1, 1, 1); // 3 from cache
 *
 * expensiveCalculation(2, 2, 2); // 6, callback executed and results cached.
 * expensiveCalculation(2, 2, 2); // 6 from cache
 *
 * // Now in a classic memozize the below would not be reexecuted. But since
 * // this memoize only has a simple memory, it will be reexecuted.
 * expensiveCalculation(1, 1, 1); // 3, callback executed and results cached.
 * expensiveCalculation(1, 1, 1); // 3 from cache
 *
 * ```
 * @param {Function} callback The function to wrap the memoize mechanism.
 *     It's expect that this function returns something.  Can't be void.
 * @return {Function}
 * @tested
 */
export function memoizeSimple(callback: Function): Function {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cachedResults: any = null;
  let cachedArgs: string | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    const stringifiedArgs = JSON.stringify(args);
    if (stringifiedArgs === cachedArgs) {
      return cachedResults;
    } else {
      cachedArgs = stringifiedArgs;
      return (cachedResults = callback(...args));
    }
  };
}

/**
 * Memoizes a function.  If the params passed to the function are the same
 * as a previous call, then the cached results are returned, saving an
 * unncessary excecution.
 *
 *
 * Consider the follwing example
 * ```ts
 * let expensiveCalculation = func.memoize((a,b,c)=> {
 *   return a + b + c;
 * })
 *
 * expensiveCalculation(1, 1, 1); // 3, callback executed and results cached.
 * expensiveCalculation(1, 1, 1); // 3 from cache
 * expensiveCalculation(1, 1, 1); // 3 from cache
 *
 * expensiveCalculation(2, 2, 2); // 6, callback executed and results cached.
 * expensiveCalculation(2, 2, 2); // 6 from cache
 *
 * expensiveCalculation(1, 1, 1); // 3 from cache
 * expensiveCalculation(2, 2, 2); // 6 from cache
 * ```
 *
 * A common case for memoize might be to use it in a class method.
 * You can implement that with this pattern.
 *
 * ```ts
 * class MyClass {
 *
 *     constructor() {
 *        this.calculate = func.memoize(this.calculate.bind(this)) as any;
 *     }
 *
 *     calculate(a, b) {
 *       return a + b;
 *     }
 * }
 *
 * ```
 *
 * @param {Function} callback The function to wrap the memoize mechanism.
 *     It's expect that this function returns something.  Can't be void.
 * @return {Function}
 * @tested
 */
export function memoize(callback: Function): Function {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cachedResults: Record<string, any> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    const stringifiedArgs = JSON.stringify(args);

    if (cachedResults[stringifiedArgs]) {
      return cachedResults[stringifiedArgs];
    }
    const result = callback(...args);
    cachedResults[stringifiedArgs] = result;
    return result;
  };
}

/**
 * A function that only ever runs once even if it is called multiple times.
 * ```
 * let hello = func.runOnlyOnce(()=> {
 *    console.log('hello');
 * })
 *
 * hello() // hello
 * hello() // cull
 * hello() // cull
 * * ```
 */
export function runOnlyOnce(callback: Function): Function {
  return runOnceOnChange(() => {
    callback();
  });
}

/**
 * Runs a function ONLY when the parameters have changed.
 *
 *
 * Running the below, you will see only four console.logs executed, each
 * when the params have changed.
 * ```ts
 *
 *   let expensiveOperation = func.runOnceOnChange(
 *       (name) => {
 *           // Do expensive stuff here.
 *           console.log(name);
 *       }
 *   );
 *
 *   expensiveOperation('Scott');  // Scott
 *   expensiveOperation('Scott');
 *   expensiveOperation('Scott');
 *   expensiveOperation('Scott');
 *   expensiveOperation('Scott');
 *   expensiveOperation('John');   // John
 *   expensiveOperation('John');
 *   expensiveOperation('Aya');    // Aya
 *   expensiveOperation('Aya');
 *   expensiveOperation('John');   // John
 *   expensiveOperation('John');
 * ```
 *
 * More in practice.  Here we want to do mutate only when the window.innerWidth
 * or windowHeight has changed.
 * ```ts
 * let updateCanvasSize = func.runOnceOnChange(
 *    (windowWidth, windowHeight)=> {
 *       // Do something expensive.
 *       console.log('Change the canvas size');
 * })
 *
 * new Raf(()=> {
 *   updateCanvasSize(window.innnerWidth, window.innerHeight);
 * });
 * ```
 *
 * You can implement this for a class method as follows
 * ```ts
 * class MyClass {
 *
 *     constructor() {
 *        this.element = document.getElementById('hello');
 *        this.render = func.runOnceOnChange(this.render.bind(this));
 *
 *        this.render(800);
 *        this.render(800); // Won't be called a second time.
 *     }
 *
 *     render(height) {
 *       this.element.style.height = height + 'px';
 *     }
 * }
 *
 * ```
 * @param {Function} callback The callback to execute.  Doesn't require
 *     the callback to return a value.
 * @tested
 */
export function runOnceOnChange(callback: Function) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cachedResults: any = null;
  let cachedArgs: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    const stringifiedArgs = JSON.stringify(args);
    // Only excute if arguments are different.
    if (stringifiedArgs !== cachedArgs) {
      cachedArgs = stringifiedArgs;
      // eslint-disable-next-line
      return (cachedResults = callback(...args));
    }
  };
}

/**
 * A method that sets the default value if undefined.
 * Useful in setting explicit default values.
 *
 * ```ts
 *
 * func.setDefault(10, 20); // 10
 * func.setDefault(undefined, 20); // 20
 * func.setDefault(undefined, false); // false
 * ```
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setDefault(value: any, defaultValue: any) {
  return Object.is(value, undefined) ? defaultValue : value;
}

/**
 * Run the callback a specific number of times.
 *
 * ```ts
 *
 *  // Runs 5 times.
 *  func.times(5, (i) => {
 *       console.log('times', i);
 *  });
 *
 * ```
 * @param count
 * @param callback
 */
export function times(count: number, callback: Function) {
  [...Array(count)].forEach((x, i) => {
    callback(i);
  });
}
/**
 * A class that helps with functions.
 */
export const func = {
  debounce,
  throttle,
  wait,
  waitUntil,
  repeatUntil,
  memoizeSimple,
  memoize,
  runOnlyOnce,
  runOnceOnChange,
  setDefault,
  times,
};
