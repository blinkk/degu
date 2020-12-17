import { ComputedStyleService } from "./computed-style-service";

function getStyle(element: Element, style: string): string {
  return ComputedStyleService.getSingleton().getComputedStyle(element)
      .getPropertyValue(style);
}

export { getStyle };
