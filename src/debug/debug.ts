export enum DebugLevel {
  NONE = 0,
  ALL = 1,
}

/**
 * A window.console like utility but with some added features.
 *
 * ```ts
 *  import { debug, DebugLevel } from 'degu/lib/debug/debug';
 * // Use debug.log as a replacement for console.log
 * debug.log('hohoho', myvariable);
 *
 * // Now suppress console.log for prod environment.
 * debug.setDebugLevel(DebugLevel.NONE);
 * ```
 *
 * You could also use urlParams or set other conditions to display logs.
 *
 * ```
 * import { debug, DebugLevel } from 'degu/debug/debug';
 * import {urlParams} from 'degu/lib/dom/url-params';
 * if(urlParams.isTrue('debug')) {
 *   debug.setDebugLevel(DebugLevel.ALL);
 *  } else {
 *   debug.setDebugLevel(DebugLevel.NONE);
 *  }
 * ```
 */
export class debug {
  private static debugLevel: DebugLevel = DebugLevel.ALL;

  static setDebugLevel(level: DebugLevel) {
    debug.debugLevel = level;
  }

  static log(...args: any[]) {
    if (debug.debugLevel === DebugLevel.NONE) {
      return;
    }

    var args = Array.prototype.slice.call(arguments);
    console.log(...args);
  }
}
