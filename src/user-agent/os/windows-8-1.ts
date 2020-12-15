import {OS} from "./base";

class Windows8_1 extends OS {
  protected static name_: string = 'Windows 8.1';
  protected static regex_: RegExp = /(Windows 8.1|Windows NT 6.3)/;
}

export {Windows8_1};
