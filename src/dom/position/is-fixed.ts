import { getStyle } from '../style/get-style';

export function isFixed(element: HTMLElement) {
  return getStyle(element, 'position') === 'fixed';
}
