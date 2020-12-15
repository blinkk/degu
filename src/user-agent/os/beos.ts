import {OS} from "./base";

class BeOS extends OS {
  protected static name_: string = 'BeOS';
  protected static regex_: RegExp = /BeOS/;
}

export {BeOS};
