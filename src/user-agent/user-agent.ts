import {Dimensions2d} from "../mathf/geometry/dimensions-2d";
import {Firefox} from "./browser/firefox";
import {Safari} from "./browser/safari";
import {Chrome} from "./browser/chrome";
import {IE} from "./browser/ie";
import {Edge} from "./browser/edge";
import {Opera} from "./browser/opera";
import {Browser} from "./browser/base";
import {USER_AGENT_STRING} from "./string";
import {OS} from "./os/base";
import {Windows8_1} from "./os/windows-8-1";
import {WindowsServer2003} from "./os/windows-server-2003";
import {WindowsVista} from "./os/windows-vista";
import {WindowsXP} from "./os/windows-xp";
import {WindowsME} from "./os/windows-me";
import {Windows2000} from "./os/windows-2000";
import {Windows98} from "./os/windows-98";
import {Windows95} from "./os/windows-95";
import {Windows10} from "./os/windows-10";
import {Windows8} from "./os/windows-8";
import {Windows7} from "./os/windows-7";
import {Unix} from "./os/unix";
import {Sun} from "./os/sun";
import {QNX} from "./os/qnx";
import {OSX} from "./os/osx";
import {OpenBSD} from "./os/open-bsd";
import {Mac} from "./os/mac";
import {Linux} from "./os/linux";
import {iOS} from "./os/ios";
import {BeOS} from "./os/beos";
import {Android} from "./os/android";
import {UnknownBrowser} from "./browser/unknown";
import {UnknownOS} from "./os/unknown";
import {is} from '..';


const browsers: (typeof Browser)[] = [
  Opera,
  Edge,
  IE,
  Chrome,
  Safari,
  Firefox,
];

const operatingSystems: (typeof OS)[] = [
  Android,
  BeOS,
  iOS,
  Linux,
  Mac,
  OpenBSD,
  OSX,
  QNX,
  Sun,
  Unix,
  Windows7,
  Windows8,
  Windows8_1,
  Windows10,
  Windows95,
  Windows98,
  Windows2000,
  WindowsME,
  WindowsServer2003,
  WindowsVista,
  WindowsXP,
];

let browser: typeof Browser = null;
let os: typeof OS = null;
let isMobile: boolean = null;

export class UserAgent {
  public static getScreenSize(): Dimensions2d {
    if (!window.screen) {
      return null;
    }
    return new Dimensions2d(window.screen.width, window.screen.height);
  }

  public static getBrowser(): typeof Browser {
    if (browser === null) {
      const matchingBrowser: typeof Browser = browsers.find(
        (candidate: typeof Browser) => candidate.isCurrentBrowser());
      browser = is.defined(matchingBrowser) ? matchingBrowser : UnknownBrowser;
    }
    return browser;
  }

  public static isMobile(): boolean {
    if (isMobile === null) {
      isMobile =
        /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(USER_AGENT_STRING);
    }
    return isMobile;
  }

  public static isCookieEnabled(): boolean {
    const cookieEnabled: boolean =
      (window.navigator.cookieEnabled) ? true : false;

    if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
      document.cookie = 'testcookie';
      return (document.cookie.indexOf('testcookie') !== -1) ? true : false;
    } else {
      return cookieEnabled;
    }
  }

  public static getOS(): typeof OS {
    if (os === null) {
      const matchingOs = operatingSystems.find((os) => os.isCurrentOS());
      os = is.defined(matchingOs) ? matchingOs : UnknownOS;
    }
    return os;
  }
}
