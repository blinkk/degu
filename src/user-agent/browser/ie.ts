import {Browser, TOffset} from "./base";

class IE extends Browser {
  protected static name_: string = 'IE';
  protected static uaidsWithOffsets_: [string, TOffset[]][] =
    [
      ['MSIE', [['MSIE', 5]]],
      ['Trident/', [['rv:', 3]]]
    ];
}

export {IE};
