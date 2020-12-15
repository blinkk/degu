import {OS} from "./base";

class Unix extends OS {
  protected static name_: string = 'UNIX';
  protected static regex_: RegExp = /UNIX/;
}

export {Unix};
