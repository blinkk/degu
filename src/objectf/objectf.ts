import * as arrayf from '../arrayf/arrayf';

/**
 * Deep copies an object by looping through it.
 * @alias arrayf.deepcopy.
 */
export function deepCopy(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: Array<any> | [key: string]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Array<any> | Object {
  return arrayf.deepCopy(input);
}

/**
 * A quick JSON parse, stringify based copy.
 * This is fast but will destroy functions, Date etc so
 * has limited usage.
 * @param object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function jsonCopy(obj: Object | Array<any>): Object | Array<any> {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * A shallow 1 level equality check of objects.
 * @param a
 * @param b
 */
export function areEqual(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  a: {[key: string]: any},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  b: {[key: string]: any}
): boolean {
  const aProps = Object.getOwnPropertyNames(a);
  const bProps = Object.getOwnPropertyNames(b);

  // If the length of object isn't equal, we know they are equal.
  if (aProps.length !== bProps.length) {
    return false;
  }

  for (let i = 0; i < aProps.length; i++) {
    const propName = aProps[i];
    if (a[propName] !== b[propName]) {
      return false;
    }
  }

  return true;
}

/**
 * Copies an object (shallow).
 * @param object
 */
export function copy(obj: Object): Object {
  return Object.assign({}, obj);
}

/**
 *
 * ```
 * objectf.forEach(myObject, (key:string, value:any)=> {
 *
 * })
 * ```
 * @param callback
 */
export function forEach(obj: Object, callback: Function) {
  Object.entries(obj).forEach(([key, value]) => {
    callback(key, value);
  });
}

/**
 * A class that helps with objects.
 */
export const objectf = {
  deepCopy,
  jsonCopy,
  areEqual,
  copy,
  forEach,
};
