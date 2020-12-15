import { Dimensions2dDom } from './dimensions-2d-dom';

export function getAncestorDimensions(
    ancestor: HTMLElement = null
): Dimensions2dDom {
  if (ancestor) {
    return Dimensions2dDom.fromElementOffset<Dimensions2dDom>(ancestor);
  } else {
    return Dimensions2dDom.fromRootElement<Dimensions2dDom>();
  }
}
