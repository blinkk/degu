import { Browser } from '../browser/base';
import { NumericRange } from '../../mathf/numeric-range';

function isFeatureSupported(
  browser: typeof Browser,
  featureSupportMap: Map<typeof Browser, NumericRange>
): boolean {
  if (!featureSupportMap.has(browser)) {
    return false;
  }
  const version = browser.getVersion();
  const range = featureSupportMap.get(browser);
  return range.contains(version);
}

export { isFeatureSupported };
