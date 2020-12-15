import {OS} from "./base";

class Mac extends OS {
  protected static name_: string = 'Mac UserAgent';
  protected static regex_: RegExp = /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/;
}

export {Mac};
