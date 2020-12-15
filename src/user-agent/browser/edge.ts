import {Browser, TOffset} from "./base";

class Edge extends Browser {
  protected static name_: string = 'Edge';
  protected static uaidsWithOffsets_: [string, TOffset[]][] =
    [
      ['Edge', [['Edge', 5]]]
    ];
}

export {Edge};
