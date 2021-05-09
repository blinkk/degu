import {
  elementVisibility,
  ElementVisibilityObject,
} from '../dom/element-visibility';
import {Raf} from '../raf/raf';

/**
 * A directive used to immediately toggle visibility of elements when it goes out of view.
 */
export class VisibilityOptimizeController {
  static get $inject() {
    return ['$scope', '$element', '$attrs'];
  }
  private element: HTMLElement;
  private ev: ElementVisibilityObject;
  private raf: Raf;

  constructor(
    $scope: ng.IScope,
    $element: ng.IAugmentedJQuery,
    $attrs: ng.IAttributes
  ) {
    this.element = $element[0];
    this.raf = new Raf();
    this.ev = elementVisibility.inview(
      this.element,
      {
        rootMargin: '200px 0px 200px 0px',
      },
      (element: any, changes: any) => {
        this.raf.write(() => {
          if (changes.isIntersecting) {
            this.element.style.visibility = '';
            // this.element.style['contentVisibility'] = '';
          } else {
            this.element.style.visibility = 'hidden';
            // this.element.style['contentVisibility'] = 'hidden';
          }
        });
      }
    );
  }
}

/**
 * Usage.
 * ```ts
 *   import { visibilityOptimizeDirective } from 'degu/lib/angular/directive-visibility-optimize';
 *
 *   const app = angular.module('myApp', []);
 *   app.directive('visibilityOptimize', visibilityOptimizeDirective);
 *   <div visibilility-optimize>
 * ```
 *
 */
export const visibilityOptimizeDirective = function () {
  return {
    restrict: 'A',
    controller: VisibilityOptimizeController,
  };
};
