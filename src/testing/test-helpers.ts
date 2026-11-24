import {type TemplateResult, render} from 'lit';
import {expect, test as vitestTest} from 'vitest';

export interface ExecutionContext {
  is<T>(actual: T, expected: T, message?: string): void;
  not<T>(actual: T, expected: T, message?: string): void;
  deepEqual<T>(actual: T, expected: T, message?: string): void;
  notDeepEqual<T>(actual: T, expected: T, message?: string): void;
  true(actual: unknown, message?: string): void;
  false(actual: unknown, message?: string): void;
  truthy(actual: unknown, message?: string): void;
  falsy(actual: unknown, message?: string): void;
  throws(fn: () => unknown, expectation?: any): any;
  pass(): void;
  fail(message?: string): never;
}

const createContext = (): ExecutionContext => ({
  is(actual, expected) {
    expect(actual).toBe(expected);
  },
  not(actual, expected) {
    expect(actual).not.toBe(expected);
  },
  deepEqual(actual, expected) {
    expect(actual).toEqual(expected);
  },
  notDeepEqual(actual, expected) {
    expect(actual).not.toEqual(expected);
  },
  true(actual) {
    expect(actual).toBe(true);
  },
  false(actual) {
    expect(actual).toBe(false);
  },
  truthy(actual) {
    expect(actual).toBeTruthy();
  },
  falsy(actual) {
    expect(actual).toBeFalsy();
  },
  throws(fn) {
    let caught: unknown;
    try {
      fn();
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeDefined();
    return caught;
  },
  pass() {
    // Explicit pass no-op.
  },
  fail(message?: string): never {
    throw new Error(message || 'Test failed');
  },
});

type TestFn = (t: ExecutionContext) => void | Promise<void>;

interface TestRunner {
  (title: string, fn: TestFn): void;
  serial: (title: string, fn: TestFn) => void;
  skip: (title: string, fn: TestFn) => void;
  only: (title: string, fn: TestFn) => void;
}

const testImpl = ((title: string, fn: TestFn) => {
  vitestTest(title, () => fn(createContext()));
}) as TestRunner;

testImpl.serial = (title: string, fn: TestFn) => {
  vitestTest(title, () => fn(createContext()));
};
testImpl.skip = (title: string, fn: TestFn) => {
  vitestTest.skip(title, () => fn(createContext()));
};
testImpl.only = (title: string, fn: TestFn) => {
  vitestTest.only(title, () => fn(createContext()));
};

export const test = testImpl;

const fixtureWrappers: HTMLElement[] = [];

const resizeObservers = new Set<{
  callback: ResizeObserverCallback;
  targets: Set<Element>;
}>();

if (typeof window !== 'undefined' && typeof HTMLElement !== 'undefined') {
  const getLayoutWidth = (el: HTMLElement): number => {
    let curr: HTMLElement | null = el;
    while (curr) {
      const w = curr.style?.width;
      if (w && w.endsWith('px')) {
        const parsed = Number.parseFloat(w);
        if (!Number.isNaN(parsed)) return parsed;
      }
      curr = curr.parentElement;
    }
    return 0;
  };

  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get() {
      return getLayoutWidth(this);
    },
  });

  if (typeof window.ResizeObserver !== 'undefined') {
    const OrigResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class MockResizeObserver extends (
      OrigResizeObserver
    ) {
      private _entry: {
        callback: ResizeObserverCallback;
        targets: Set<Element>;
      };
      constructor(callback: ResizeObserverCallback) {
        super(callback);
        this._entry = {callback, targets: new Set()};
        resizeObservers.add(this._entry);
      }
      override observe(target: Element) {
        this._entry.targets.add(target);
        super.observe(target);
      }
      override unobserve(target: Element) {
        this._entry.targets.delete(target);
        super.unobserve(target);
      }
      override disconnect() {
        this._entry.targets.clear();
        resizeObservers.delete(this._entry);
        super.disconnect();
      }
    };
  }
}

export function triggerResizeObservers() {
  for (const obs of resizeObservers) {
    if (obs.targets.size > 0) {
      const entries = Array.from(obs.targets).map(
        (target) =>
          ({
            target,
            contentRect: {
              width: (target as HTMLElement).offsetWidth,
              height: (target as HTMLElement).offsetHeight,
            },
          }) as unknown as ResizeObserverEntry
      );
      obs.callback(entries, {} as ResizeObserver);
    }
  }
}

export async function fixture<T extends Element = HTMLElement>(
  template: TemplateResult
): Promise<T> {
  const wrapper = document.createElement('div');
  document.body.appendChild(wrapper);
  fixtureWrappers.push(wrapper);
  render(template, wrapper);
  const el = wrapper.firstElementChild as T & {
    updateComplete?: Promise<boolean>;
  };
  const customEls = [el, ...Array.from(wrapper.querySelectorAll('*'))] as Array<
    Element & {updateComplete?: Promise<boolean>}
  >;
  for (const node of customEls) {
    if (node?.updateComplete) {
      await node.updateComplete;
    }
  }
  triggerResizeObservers();
  for (const node of customEls) {
    if (node?.updateComplete) {
      await node.updateComplete;
    }
  }
  return el;
}

export function fixtureCleanup() {
  while (fixtureWrappers.length > 0) {
    fixtureWrappers.pop()?.remove();
  }
}

export function aTimeout(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
