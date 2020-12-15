import {OS} from "./base";

class WindowsServer2003 extends OS {
  protected static name_: string = 'Windows Server 2003';
  protected static regex_: RegExp = /Windows NT 5.2/;
}

export {WindowsServer2003};
