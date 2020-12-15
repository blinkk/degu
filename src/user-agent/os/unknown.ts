import {OS} from "./base";

class UnknownOS extends OS {
  protected static name_: string = 'UnknownOS';
  protected static regex_: RegExp = /.*/;
}

export {UnknownOS};
