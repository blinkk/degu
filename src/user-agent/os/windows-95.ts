import {OS} from "./base";

class Windows95 extends OS {
  protected static name_: string = 'Windows 95';
  protected static regex_: RegExp = /(Windows 95|Win95|Windows_95)/;
}

export {Windows95};
