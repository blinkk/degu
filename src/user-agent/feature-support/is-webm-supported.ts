import { NumericRange } from '../../mathf/numeric-range';
import { Browser } from '../browser/base';
import { Edge } from '../browser/edge';
import { Firefox } from '../browser/firefox';
import { Chrome } from '../browser/chrome';
import { Opera } from '../browser/opera';
import { isFeatureSupported } from './is-feature-supported';

const webmSupportedBrowsers: Map<typeof Browser, NumericRange> = new Map<
  typeof Browser,
  NumericRange
>([
  [Edge, new NumericRange(75, Number.POSITIVE_INFINITY)],
  [Firefox, new NumericRange(28, Number.POSITIVE_INFINITY)],
  [Chrome, new NumericRange(25, Number.POSITIVE_INFINITY)],
  [Opera, new NumericRange(16, Number.POSITIVE_INFINITY)]
]);

function isWebmSupported(browser: typeof Browser): boolean {
  return isFeatureSupported(browser, webmSupportedBrowsers);
}

export { isWebmSupported };
