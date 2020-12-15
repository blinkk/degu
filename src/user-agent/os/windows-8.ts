import {OS} from "./base";

class Windows8 extends OS {
  protected static name_: string = 'Windows 8';
  protected static regex_: RegExp = /(Windows 8|Windows NT 6.2)/;
}

export {Windows8};
