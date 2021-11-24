import {assert, expect, fixture, html, aTimeout} from '@open-wc/testing';
import {DeguImage} from './image';
import * as dom from '../dom/dom';

// Define it.
!window.customElements.get('degu-image') &&
  window.customElements.define('degu-image', DeguImage);

dom.addStylesToPage(`
    degu-image {
        display: inline-block;
        line-height: 0;
        width: 100%;
    }
    degu-image img {
      max-width: 100%
      height: auto
    }
`);

describe('DeguImage', () => {
  let root: HTMLElement;
  let imageComponent: DeguImage;
  let image: HTMLImageElement;

  describe('autowidth feature', () => {
    beforeEach(async () => {
      root = await fixture(
        html`<div id="root" style="width: 500px">
          <degu-image
            src="https://lh3.googleusercontent.com/Gvs7l32oWrEt2sEphd1U1ERiGO25n4CosYiD7EL-uEEn9Kb6L1aR-gw-RdB5ZfCp7y0gF8WyHkZHNe7Xk_CzLUKOGdODQIafKFg"
            width="640"
            height="640"
            style="aspect-ratio: 1"
            alt="Image Aria Label"
            class=""
          ></degu-image>
        </div>`
      );

      imageComponent = root.querySelector('degu-image');
      image = imageComponent.querySelector('img');
    });

    it('is defined', () => {
      assert.instanceOf(imageComponent, DeguImage);
    });

    it('renders an image with alt', async () => {
      expect(image.getAttribute('alt')).to.equal('Image Aria Label');
    });

    it('renders FIFE image with autowidth sizes.', async () => {
      // Starting size.
      expect(root.offsetWidth).to.equal(500);
      expect(image.src.endsWith('500')).to.equal(true);

      // Size it up.
      root.style.width = '1222px';
      expect(root.offsetWidth).to.equal(1222);
      expect(imageComponent.offsetWidth).to.equal(1222);

      // Wait at least 100ms due to debouncing.
      await aTimeout(200);
      expect(image.src.endsWith('1250')).to.equal(true);

      // Sizing it down should not make another request.
      root.style.width = '1100px';
      expect(root.offsetWidth).to.equal(1100);
      expect(imageComponent.offsetWidth).to.equal(1100);
      // Wait at least 100ms due to debouncing.
      await aTimeout(200);
      expect(image.src.endsWith('1250')).to.equal(true);
    });
  });
});
