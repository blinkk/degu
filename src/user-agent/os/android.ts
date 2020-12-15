import {OS} from "./base";

class Android extends OS {
  protected static name_: string = 'Android';
  protected static regex_: RegExp = /Android/;
}

export {Android};
