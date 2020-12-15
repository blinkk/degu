import {OS} from "./base";

class QNX extends OS {
  protected static name_: string = 'QNX';
  protected static regex_: RegExp = /QNX/;
}

export {QNX};
