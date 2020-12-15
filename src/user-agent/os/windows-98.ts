import {OS} from "./base";

class Windows98 extends OS {
  protected static name_: string = 'Windows 98';
  protected static regex_: RegExp = /(Windows 98|Win98)/;
}

export {Windows98};
