export class nullController {
    static get $inject() {
        return ['$scope', '$element'];
    }
    constructor($scope: ng.IScope, $element: ng.IAngularStatic) {}
}