import {OS} from "./base";

class iOS extends OS {
  protected static name_: string = 'iOS';
  protected static regex_: RegExp = /(iPhone|iPad|iPod)/;
}

export {iOS};
