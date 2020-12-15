import { Browser, TOffset } from './base';
import { USER_AGENT_STRING } from '../string';

class Firefox extends Browser {

  static getVersion(): number {
    return parseFloat(USER_AGENT_STRING.split('Firefox/')[1].split(' ')[0]);
  }
  protected static name_: string = 'Firefox';
  protected static uaidsWithOffsets_: Array<[string, TOffset[]]> =
    [
      ['Firefox', [['Firefox', 8]]]
    ];
}

export { Firefox };
