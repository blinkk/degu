import {ComputedStyleService} from "./computed-style-service";
import {UserAgent} from "../../user-agent/user-agent";

const computedStyleService = ComputedStyleService.getSingleton();
const browser = UserAgent.getBrowser();

function getStyle(element: Element, style: string): string {
  const supportedStyleProperty = browser.getSupportedStyleProperty(style);
  const rawValue =
      computedStyleService.getComputedStyle(element)
          .getPropertyValue(supportedStyleProperty);
  return browser.getGenericStyleValue(style, rawValue);
}

export {getStyle};
