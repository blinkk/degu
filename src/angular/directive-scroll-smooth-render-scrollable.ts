import {DomWatcher} from '../dom/dom-watcher';
import * as dom from '../dom/dom';
import {ScrollSmoothRenderEvents} from '../dom/scroll-smooth-render';

export class ScrollSmoothRenderScrollableController {
  private el: HTMLElement;
  private $scope: ng.IScope;
  private domWatcher: DomWatcher;

  static get $inject() {
    return ['$scope', '$element'];
  }
  constructor($scope: ng.IScope, $element: ng.IAugmentedJQuery) {
    this.el = $element[0];
    this.$scope = $scope;
    this.domWatcher = new DomWatcher();

    this.domWatcher.add({
      element: this.el,
      on: 'mouseenter',
      callback: () => {
        console.log('mouseenter');
        dom.event(
          document.documentElement,
          ScrollSmoothRenderEvents.DISABLE,
          {}
        );
      },
      eventOptions: {
        passive: true,
      },
    });

    this.domWatcher.add({
      element: this.el,
      on: 'mouseleave',
      callback: () => {
        console.log('mouseleave');
        dom.event(
          document.documentElement,
          ScrollSmoothRenderEvents.ENABLE,
          {}
        );
      },
      eventOptions: {
        passive: true,
      },
    });

    $scope.$on('$destroy', () => {
      this.dispose();
    });
  }

  private dispose(): void {
    this.domWatcher.dispose();
  }
}

/**
 * A directive to be used with scroll-smooth-render where you want
 * certain areas scrollable.
 *
 * ```
 *    import { scrollSmoothRenderScrollable } from 'degu/lib/angular/directive-scroll-smooth-render-scrollable';
 *   app.directive('scrollArea', scrollSmoothRenderScrollable);
 *
 * <div scroll-area>
 *    a scrollable div
 * </div>
 * ```
 */
export const scrollSmoothRenderScrollable = function () {
  return {
    restrict: 'A',
    controller: ScrollSmoothRenderScrollableController,
  };
};
