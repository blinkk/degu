import * as $ from 'jquery';

/**
 * A service that smooth scrolls to a specific #id.
 */
class SmoothScrollController {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private jQuery: any;
  private id: string;
  private offset: number;
  private $element: ng.IRootElementService;
  private element: HTMLElement;
  private animating = false;
  private duration: number;

  static get $inject() {
    return ['$element', '$scope', '$attrs'];
  }

  constructor(
    $element: ng.IRootElementService,
    $scope: ng.IScope,
    $attrs: ng.IAttributes
  ) {
    this.jQuery = $;
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
    $element.on('click', this.scrollTo.bind(this));

    $scope.$on('$destroy', () => {
      this.dispose_();
    });
  }

  scrollTo(e: JQueryMouseEventObject) {
    e.preventDefault();
    if (this.animating) {
      return;
    }
    this.animating = true;

    const page = this.jQuery('body, html');
    const top = this.jQuery('#' + this.id).offset()!.top - this.offset;

    const animationComplete = () => {
      this.animating = false;
      page.off(
        'scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove'
      );
      page.stop();
    };

    page.on(
      'scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove',
      animationComplete
    );

    page.stop().animate(
      {
        scrollTop: top,
      },
      this.duration,
      animationComplete
    );
  }

  dispose_() {
    this.$element.off('click', this.scrollTo);
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
