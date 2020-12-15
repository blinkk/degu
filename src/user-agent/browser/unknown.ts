import {Browser, TOffset} from "./base";

class UnknownBrowser extends Browser {
  protected static name_: string = 'UnknownBrowser';
  protected static uaidsWithOffsets_: [string, TOffset[]][] = [];
}

export {UnknownBrowser};
