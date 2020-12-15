import {Browser, TOffset} from "./base";
import {MultiValueMap} from "../../map/multi-value";

class Safari extends Browser {
  protected static name_: string = 'Safari';
  protected static uaidsWithOffsets_: [string, TOffset[]][] =
    [
      ['Safari', [['Version', 8], ['Safari', 7]]]
    ];
  protected static genericStyleValueToSupported_:
    MultiValueMap<string, string> =
      new MultiValueMap([
        [['position', 'sticky'], '-webkit-sticky'],
      ]);
}

export {Safari};
