import {OS} from "./base";

class Windows10 extends OS {
  protected static name_: string = 'Windows 10';
  protected static regex_: RegExp = /(Windows 10.0|Windows NT 10.0)/;
}

export {Windows10};
