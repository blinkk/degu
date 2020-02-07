import { DomWatcher } from '../dom/dom-watcher';
import { INgDisposable } from './i-ng-disposable';
import { dom } from '../dom/dom';
import { func } from '../func/func';

export class CssVarWidth implements INgDisposable {
    static get $inject() {
        return ['$scope', '$element', '$attrs'];
    }

    private el: HTMLElement;
    private watcher: DomWatcher;
    private scalar:number;
    private margin:number;
    private max: number|null;

    constructor($scope: ng.IScope, $element: ng.IAngularStatic, $attrs: ng.IAttributes) {
        this.el = $element[0];
        this.watcher = new DomWatcher();

        this.scalar = $attrs.cssVarWidthScalar || 1;
        this.margin = $attrs.cssVarWidthMargin || 0;
        this.max = func.setDefault($attrs.cssVarWidthMax, null);
        this.watcher.add({
            element: window,
            on: 'smartResize',
            callback: this.paint.bind(this)
        });

        this.paint();

        $scope.$on('$destroy', () => {
            this.dispose();
        });
    }

    paint() {
        let width = this.el.offsetWidth;
        width *= this.scalar;
        width -= (this.margin * 2);
        if(this.max) {
            width = Math.min(width, this.max);
        }
        dom.setCssVariable(this.el, '--width', String(width));
    }

    dispose() {
        this.watcher.dispose();
    }
}



/*
 Usage:

  ngApp.directive('cssVarwidth', cssVarWidthDirective);


  <div css-var-width></div>

  Results in:
  <div style="--width: 1302;"></div>

  // Optionally, add a scalar (percentage).
  <div css-var-width css-var-width-scalar="0.93"></div>
  // Optionally, add a margin in px.  Px margin is doubled to account for left and right side.
  <div css-var-width css-var-width-margin="20"></div>
  // Optionally add a max value
  <div css-var-width css-var-width-max="1000"></div>

 */
export const cssVarWidthDirective = function () {
    return {
        restrict: 'A',
        controller: CssVarWidth,
    };
}

