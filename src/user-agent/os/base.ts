import {USER_AGENT_STRING} from "../string";

abstract class OS {
  protected static name_: string;
  protected static regex_: RegExp;

  public static getAsCSSModifier() {
    return this.name_.toLowerCase().replace(/\s/, '-');
  }

  public static isCurrentOS(): boolean {
    return this.regex_.test(USER_AGENT_STRING);
  }
}

export {OS};
