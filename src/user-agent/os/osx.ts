import {OS} from "./base";

class OSX extends OS {
  protected static name_: string = 'Mac UserAgent X';
  protected static regex_: RegExp = /Mac OS X/;
}

export {OSX};
