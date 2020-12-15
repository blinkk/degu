import {OS} from "./base";

class Sun extends OS {
  protected static name_: string = 'Sun UserAgent';
  protected static regex_: RegExp = /SunOS/;
}

export {Sun};
