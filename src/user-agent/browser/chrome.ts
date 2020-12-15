import {Browser, TOffset} from "./base";

class Chrome extends Browser {
  protected static name_: string = 'Chrome';
  protected static uaidsWithOffsets_: [string, TOffset[]][] =
    [
      ['Chrome', [['Chrome', 7]]]
    ];
}

export {Chrome};
