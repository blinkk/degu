import * as dom from '../dom/dom';

/**
 * A service that smooth scrolls to a specific #id.
 */
class SmoothScrollController {
  private id: string;
  private offset: number;
  private $element: ng.IRootElementService;
  private element: HTMLElement;
  private animating = false;
  private duration: number;
  private cancelScroll: (() => void) | null = null;
  private boundScrollTo: (e: Event) => void;

  static get $inject() {
    return ['$element', '$scope', '$attrs'];
  }

  constructor(
    $element: ng.IRootElementService,
    $scope: ng.IScope,
    $attrs: ng.IAttributes
  ) {
    this.$element = $element;
    this.element = $element[0];
    this.offset = +$attrs.smoothScrollClickOffset || 0;
    this.duration = +$attrs.smoothScrollClickDuration || 800;

    // Check where id was used to evaluated anglar values
    // versus sometimes we just want to use the string output.
    this.id = $attrs.smoothScrollClick;
    if ($attrs.smoothScrollClickEval) {
      this.id = $scope.$eval($attrs.smoothScrollClick);
    }

    this.animating = false;
    this.boundScrollTo = this.scrollTo.bind(this);
    $element.on('click', this.boundScrollTo);

    $scope.$on('$destroy', () => {
      this.dispose_();
    });
  }

  scrollTo(e: Event) {
    e.preventDefault();
    if (this.animating) {
      return;
    }
    const targetEl = document.getElementById(this.id);
    if (!targetEl) {
      return;
    }
    this.animating = true;

    const top =
      targetEl.getBoundingClientRect().top + window.scrollY - this.offset;
    this.cancelScroll = dom.smoothScrollTo(top, this.duration, () => {
      this.animating = false;
      this.cancelScroll = null;
    });
  }

  dispose_() {
    this.cancelScroll && this.cancelScroll();
    this.cancelScroll = null;
    this.$element.off('click', this.boundScrollTo);
  }
}

/**
 * A directive to scroll to a specific #id.
 *
 * smooth-scroll-click (string): Contains the #id of the element to
 *      scroll to.
 * smooth-scroll-click-offset (number): Optional offset value for the scroll.
 * smooth-scroll-click-duration (number): Optional value to specify scroll duration.
 * smooth-scroll-click-eval (boolean): Whether to force eval mode.
 *
 * <div
 *     smooth-scroll-click="'id-to-smooth-scroll-to'"
 *     smooth-scroll-click-offset="100"
 *     smooth-scroll-click-duration="1000"
 * </div>
 *
 * <div
 *     smooth-scroll-click="myAngularCtrl.value"
 *     smooth-scroll-click-offset="100"
 *     smooth-scroll-click-eval="true"
 * </div>
 *
 */
export const smoothScrollClickDirective = function () {
  return {
    restrict: 'A',
    controller: SmoothScrollController,
  };
};
