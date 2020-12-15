import {OS} from "./base";

class Linux extends OS {
  protected static name_: string = 'Linux';
  protected static regex_: RegExp = /(Linux|X11)/;
}

export {Linux};
