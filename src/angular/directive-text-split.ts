import {INgDisposable} from './i-ng-disposable';

import {TextSplit2} from '../dom/text-split2';

class TextSplitController implements INgDisposable {
  static get $inject() {
    return ['$scope', '$element'];
  }

  private el: HTMLElement;
  private $scope: ng.IScope;
  private textSplitter: TextSplit2;

  constructor($scope: ng.IScope, $element: ng.IAugmentedJQuery) {
    this.$scope = $scope;
    this.el = $element[0];
    this.textSplitter = new TextSplit2({
      element: this.el,
    });
    this.textSplitter.split();

    $scope.$on('$destroy', () => {
      this.dispose();
    });
  }

  dispose(): void {
    this.textSplitter.dispose();
  }
}

/**
 * Implements the textSplit2 effect.
 *
 * ```
 *     import { textSplitDirective } from 'degu/lib/angular/directive-text-split';
 *     ngApp.directive('textSplit', textSplitDirective);
 *
 *
 *    <div text-split aria-label="text">text</div>
 * ```
 */
export const textSplitDirective = () => {
  return {
    restrict: 'A',
    controller: TextSplitController,
  };
};
