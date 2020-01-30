import { DomWatcher } from '../dom/dom-watcher';
import { INgDisposable } from './i-ng-disposable';
import { dom } from '../dom/dom';

export class CssVarWidth implements INgDisposable {
    static get $inject() {
        return ['$scope', '$element', '$attrs'];
    }

    private el: HTMLElement;
    private watcher: DomWatcher;

    constructor($scope: ng.IScope, $element: ng.IAngularStatic, $attrs: ng.IAttributes) {
        this.el = $element[0];
        this.watcher = new DomWatcher();
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
        dom.setCssVariable(this.el, '--width', this.el.offsetWidth + 'px');
    }

    dispose() {
        this.watcher.dispose();
    }
}



export const cssVarWidthDirective = function () {
    return {
        restrict: 'A',
        controller: CssVarWidth,
    };
}

