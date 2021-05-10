import {LottieButton, LottieButtonRange} from '../dom/lottie-button';

class LottieButtonController {
  static get $inject() {
    return ['$scope', '$element'];
  }
  private el: HTMLElement;
  private $scope: ng.IScope;
  private lottieButton: LottieButton;

  constructor($scope: ng.IScope, $element: ng.IAugmentedJQuery) {
    this.$scope = $scope;
    this.el = $element[0];

    const playSettings = JSON.parse(
      this.el.getAttribute('lottie-play-settings')!
    ) as any;

    this.lottieButton = new LottieButton({
      rootElement: this.el,
      lottieElement: this.el.querySelector('[lottie-element]')!,
      lottieJson: this.el.getAttribute('lottie-json-path')!,
      inview: playSettings.inview as LottieButtonRange,
      click: playSettings.click as LottieButtonRange,
      mouseleave: playSettings.mouseleave as LottieButtonRange,
      mouseenter: playSettings.mouseenter as LottieButtonRange,
      noListeners: playSettings.noListeners || false,
      loadImmediately: this.el.getAttribute('lottie-load-immediate') === 'true',
    });

    if (this.el.getAttribute('lottie-enable-play-queue')) {
      this.lottieButton.enablePlayQueue(true);
    }

    $scope.$on('$destroy', () => {
      this.dispose();
    });
  }

  private dispose(): void {
    this.lottieButton.dispose();
  }
}

/**
 * ```
 *   import { lottieButtonDirective } from 'degu/lib/angular/directive-lottie-button';
 *   app.directive('lottieButton', lottieButtonDirective);
 *
 *
 * {% set playSettings = {
 *    'mouseover': {
 *       'start': 72,
 *       'end': 96,
 *    },
 *    'mouseleave': {
 *       'start': 156,
 *       'end': 180,
 *   },
 *    'click': {
 *       'start': 196,
 *       'end': 216,
 *   },
 * }
 * %}
 * <div lottie-button lottie-json-path="{{lottie_json_path}}" lottie-play-settings="{{playSettings|jsonify}}">
 *        <div lottie-element></div>
 * </div>
 * ```
 */
export const lottieButtonDirective = () => {
  return {
    restrict: 'A',
    controller: LottieButtonController,
  };
};
