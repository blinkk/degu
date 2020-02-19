

/**
 * A simple controller used to setup basic drawer like functionality.
 *
 * Example usage:
 * ```ts
 *
 *  .toggle__drawer
 *     display: none
 * .toggle--open
 *    .toggle__drawer
 *        display: block
 *
 *
 * <div class="toggle"
 *  ng-class="{
 *     'toggle--open':  toggleCtrl.expanded
 *  }"
 *  ng-controller="ToggleController as toggleCtrl">
 *     <div class="toggle__content" ng-click="toggleCtrl.toggle()">
 *         What city is the capital of Japan?
 *     </div>
 *     <div class="toggle__drawer">
 *         Tokyo.
 *     </div>
 * </div>
 * ```
 *
 *
 */
export class ToggleController {

    private el: HTMLElement;
    private expanded: boolean;

    static get $inject() {
        return ['$scope', '$element'];
    }

    constructor($element: ng.IAngularStatic) {
        this.el = $element[0];
        this.expanded = false;
    }

    public toggle():void {
       this.expanded = !this.expanded;
    }

    public open():void {
       this.expanded = true;
    }

    public close():void {
       this.expanded = false;
    }
}