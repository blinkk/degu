import {DeguImage} from './image';

const defaultComponents: Record<string, typeof HTMLElement> = {
  'degu-image': DeguImage,
};

export const register = (components = defaultComponents) => {
  for (const key in components) {
    !window.customElements.get(key) &&
      window.customElements.define(key, components[key]);
  }
};
