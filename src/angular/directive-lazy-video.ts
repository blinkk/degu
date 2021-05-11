import {DomWatcher} from '../dom/dom-watcher';
import * as dom from '../dom/dom';
import {func} from '../func/func';
import {is} from '../is/is';
import {
  elementVisibility,
  ElementVisibilityObject,
} from '../dom/element-visibility';

export const LazyVideoEvents = {
  LOAD_START: 'LOAD_START',
};

export class LazyVideoController {
  private el: HTMLElement;
  private parent: HTMLVideoElement;
  private url: string;
  private setComplete: boolean;
  private ev: ElementVisibilityObject;
  private watcher: DomWatcher;

  // The amount of rootMargin offset to apply to lazyimage.
  // 1 would result in a forward load of 1 * window.innerHeight.
  // 0 would mean no forward load.
  // Defaults to 1.
  // Set to higher values if you want to load aggressively load video that are below
  // the current fold.
  private forwardLoadScalar: number;

  static get $inject() {
    return ['$scope', '$element', '$attrs'];
  }

  constructor(
    $scope: ng.IScope,
    $element: ng.IAugmentedJQuery,
    $attrs: ng.IAttributes
  ) {
    this.el = $element[0];
    this.parent = <HTMLVideoElement>this.el.parentElement!;

    this.watcher = new DomWatcher();
    this.watcher.add({
      element: window,
      on: 'smartResize',
      callback: func.debounce(this.resize.bind(this), 500),
    });

    this.forwardLoadScalar = is.defined($attrs.lazyVideoForwardLoadScalar)
      ? +$attrs.lazyVideoForwardLoadScalar
      : 1;

    /**
     * The Video source.
     */
    this.url = $attrs.lazyVideo;

    /**
     * Whether this directive has finished setting the video.
     */
    this.setComplete = false;

    this.ev = elementVisibility.inview(
      this.parent,
      {
        rootMargin: window.innerHeight * this.forwardLoadScalar + 'px',
      },
      () => {
        this.paint();
      }
    );

    // Immediately attempt to apint.
    this.ev.readyPromise.then(() => {
      this.paint();
    });

    $scope.$on('$destroy', () => {
      this.dispose();
    });
  }

  resize() {
    if (!this.setComplete) {
      this.paint();
    }
  }

  /**
   * Attemps to set the video source if possible.
   */
  paint() {
    if (this.isPainted() && !this.setComplete) {
      this.setComplete = true;
      this.el.setAttribute('src', this.url);

      // Tell the parent element (video) to load.
      this.parent.load();
      dom.event(this.parent, LazyVideoEvents.LOAD_START, {});

      // Once it's loaded, dispose of this module.
      this.dispose();
    }
  }

  /**
   * Determines whether this element was painted (displayed on the screen).
   * The basis of this is having a css class of display none.  Other methods
   * of hiding the element will return true.
   */
  isPainted() {
    return (
      !dom.isDisplayNoneWithAncestors(this.parent) && this.ev.state().inview
    );
  }

  dispose() {
    this.ev.dispose();
    this.watcher.dispose();
  }
}

/**
 * Allows loading of video only if the element or the child
 * is currently visible on the screen.  The basis of whether it is visible
 * is determined based on if the dislay is NOT set to none.
 *
 *  * Name your directive as lazyImage.
 *
 * ```
 *     import { lazyVideoDirective } from 'degu/lib/angular/directive-lazy-video';
 *     ngApp.directive('lazyVideo', lazyVideoDirective);
 * ```
 *
 * This will load the image:
 * <video>
 *   <source type="video/mp4" lazy-video="{{url}}"></source>
 * <video>
 *
 *
 *
 * After render will turn into:
 * <video>
 *   <source type="video/mp4" lazy-video="{{url}}" src="..."></source>
 * <video>
 *
 *
 * This will load only when on mobile.
 * .only-mobile
 *   +md
 *     display: none
 *
 * <video class="only-mobile">
 *   <source type="video/mp4" lazy-video="{{url}}"></source>
 * <video>
 *
 *
 * # Forward Scalar
 * Adjust the forward scalar to higher values to load videos more aggressively.
 *   <source lazy-video="{{url}}" lazy-video-forward-load-scalar="3"></source>
 *
 *
 *
 * # Listen for events.
 * Events get fired on the video element.
 *
 * ```
 * import { lazyVideoDirective, lazyVideoEvents } from 'degu/lib/angular/directive-lazy-video';
 * document.getElementById("myvideo").addEventListener(lazyVideoEvents.LOAD_START, ()=. {
 *    // Loading started!
 * }, { once: true});
 *
 *
 * <video id="myvideo" class="only-mobile">
 *   <source type="video/mp4" lazy-video="{{url}}"></source>
 * <video>
 * ```
 *
 */
export const lazyVideoDirective = function () {
  return {
    restrict: 'A',
    controller: LazyVideoController,
  };
};
