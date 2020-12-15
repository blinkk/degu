import {OS} from "./base";

class Windows2000 extends OS {
  protected static name_: string = 'Windows 2000';
  protected static regex_: RegExp = /(Windows NT 5.0|Windows 2000)/;
}

export {Windows2000};
