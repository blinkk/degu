import {OS} from "./base";

class Windows7 extends OS {
  protected static name_: string = 'Windows 7';
  protected static regex_: RegExp = /(Windows 7|Windows NT 6.1)/;
}

export {Windows7};
