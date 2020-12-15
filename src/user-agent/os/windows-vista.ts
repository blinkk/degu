import {OS} from "./base";

class WindowsVista extends OS {
  protected static name_: string = 'Windows Vista';
  protected static regex_: RegExp = /Windows NT 6.0/;
}

export {WindowsVista};
