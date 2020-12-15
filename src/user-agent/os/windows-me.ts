import {OS} from "./base";

class WindowsME extends OS {
  protected static name_: string = 'Windows ME';
  protected static regex_: RegExp = /(Win 9x 4.90|Windows ME)/;
}

export {WindowsME};
