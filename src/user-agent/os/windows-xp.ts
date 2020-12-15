import {OS} from "./base";

class WindowsXP extends OS {
  protected static name_: string = 'Windows XP';
  protected static regex_: RegExp = /(Windows NT 5.1|Windows XP)/;
}

export {WindowsXP};
