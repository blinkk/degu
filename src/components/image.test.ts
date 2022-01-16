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
      max-width: 100%;
      height: auto;
      position: relative;
    }
`);

describe('DeguImage', () => {
  let root: HTMLElement;
  let imageComponent: DeguImage;
  let image: HTMLImageElement;
  let picture: HTMLPictureElement;

  describe('autowidth feature', () => {
    beforeEach(async () => {
      root = await fixture(
        html`<div id="root" style="width: 500px">
          <degu-image
            src="https://lh3.googleusercontent.com/vXVYAHWMv1dPPXh1QJ1Ykr-BAIDLDMH0uZEOsvQkAKKgIYyNGe8lkJvU2stCFg84Rk4q7T7rMDqzx2vUjZlqfJX_rHsPQwyxBvamt38"
            width="4032"
            height="3024"
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

    it('renders google image with autowidth sizes.', async () => {
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

    it('renders without width and height if not specified', async () => {
      root = await fixture(
        html`<div id="root" style="width: 500px">
          <degu-image
            src="https://lh3.googleusercontent.com/vXVYAHWMv1dPPXh1QJ1Ykr-BAIDLDMH0uZEOsvQkAKKgIYyNGe8lkJvU2stCFg84Rk4q7T7rMDqzx2vUjZlqfJX_rHsPQwyxBvamt38"
            style="aspect-ratio: 1"
            alt="Image Aria Label"
            class=""
          ></degu-image>
        </div>`
      );

      imageComponent = root.querySelector('degu-image');
      image = imageComponent.querySelector('img');
      picture = imageComponent.querySelector('picture');
      expect(image.hasAttribute('width')).to.equal(false);
      expect(image.hasAttribute('height')).to.equal(false);
    });
  });

  describe('loading mode', () => {
    it('defaults to lazy', async () => {
      root = await fixture(
        html`<div id="root" style="width: 500px">
          <degu-image
            src="https://lh3.googleusercontent.com/vXVYAHWMv1dPPXh1QJ1Ykr-BAIDLDMH0uZEOsvQkAKKgIYyNGe8lkJvU2stCFg84Rk4q7T7rMDqzx2vUjZlqfJX_rHsPQwyxBvamt38"
            style="aspect-ratio: 1"
            alt="Image Aria Label"
            class=""
          ></degu-image>
        </div>`
      );

      imageComponent = root.querySelector('degu-image');
      image = imageComponent.querySelector('img');
      expect(image.getAttribute('loading')).to.equal('lazy');
    });

    it('allows users to specify loading mode', async () => {
      root = await fixture(
        html`<div id="root" style="width: 500px">
          <degu-image
            src="https://lh3.googleusercontent.com/vXVYAHWMv1dPPXh1QJ1Ykr-BAIDLDMH0uZEOsvQkAKKgIYyNGe8lkJvU2stCFg84Rk4q7T7rMDqzx2vUjZlqfJX_rHsPQwyxBvamt38"
            style="aspect-ratio: 1"
            loading="eager"
            alt="Image Aria Label"
            class=""
          ></degu-image>
        </div>`
      );

      imageComponent = root.querySelector('degu-image');
      image = imageComponent.querySelector('img');
      expect(image.getAttribute('loading')).to.equal('eager');
    });
  });

  describe('svg images', () => {
    beforeEach(async () => {
      root = await fixture(
        html`<div id="root" style="width: 500px">
          <degu-image
            src="https://placeholder-dot-madebygoog.appspot.com/2650x720.svg"
            alt="Logo"
          ></degu-image>
        </div>`
      );

      imageComponent = root.querySelector('degu-image');
      image = imageComponent.querySelector('img');
      picture = imageComponent.querySelector('picture');
    });

    it('is defined', () => {
      assert.instanceOf(imageComponent, DeguImage);
      assert.instanceOf(image, HTMLImageElement);
    });

    it('renders an image with alt', async () => {
      expect(image.getAttribute('alt')).to.equal('Logo');
    });

    it('renders in single image mode', async () => {
      expect(picture).to.equal(null);
    });

    it('renders in single image mode even with parameters', async () => {
      root = await fixture(
        html`<div id="root" style="width: 500px">
          <degu-image
            src="https://placeholder-dot-madebygoog.appspot.com/2650x720.svg?bgColor=FFEFA4"
            alt="Logo"
          ></degu-image>
        </div>`
      );

      imageComponent = root.querySelector('degu-image');
      image = imageComponent.querySelector('img');
      picture = imageComponent.querySelector('picture');
      expect(picture).to.equal(null);
    });

    it('renders without width and height if not specified', async () => {
      expect(image.hasAttribute('width')).to.equal(false);
      expect(image.hasAttribute('height')).to.equal(false);
    });
  });
});
