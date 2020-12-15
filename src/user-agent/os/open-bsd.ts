import {OS} from "./base";

class OpenBSD extends OS {
  protected static name_: string = 'Open BSD';
  protected static regex_: RegExp = /OpenBSD/;
}

export {OpenBSD};
