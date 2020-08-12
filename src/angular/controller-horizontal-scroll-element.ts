import { HorizontalScrollElement } from '../dom/horizontal-scroll-element';
import { INgDisposable } from "./i-ng-disposable";


export interface HorizontalScrollElementControllerInitConfig {
    scrollSelector: string;
}

/**
 *
 * ```
 *
 * import { HorizontalScrollElementController } from 'yano-js/lib/angular/controller-horizontal-scroll-element';
 * app.controller('HorizontalScrollElementController', HorizontalScrollElementController);
 *
 * ```
 *
 *
 * @see HorizontalScrollElement for docs.
 */
export class HorizontalScrollElementController implements INgDisposable {

    private el: HTMLElement;
    private scrollElement: HTMLElement;
    private $scope: ng.IScope;
    private horizontalScroll: HorizontalScrollElement;
    static get $inject() {
        return ['$scope', '$element', '$attrs'];
    }

    constructor($scope: ng.IScope, $element: ng.IAngularStatic, $attrs: ng.IAttributes) {
        this.$scope = $scope;
        this.el = $element[0];
        $scope.$on('$destroy', () => {
            this.dispose();
        });
    }


    public init(config: HorizontalScrollElementControllerInitConfig) {
        this.scrollElement = this.el;
        if(config.scrollSelector) {
            this.scrollElement = this.el.querySelector(config.scrollSelector);
            if(!this.scrollElement) {
                throw new Error('An element with the selector ' + config.scrollSelector + ' was not found');
            }
        }

        window.setTimeout(()=> {
            this.horizontalScroll = new HorizontalScrollElement(this.scrollElement, true);
            this.horizontalScroll.enableSlideDeltaValues(true);

            const deltaSelector = this.el.getAttribute('add-delta-value-elements-selector');
            if(deltaSelector) {
                const group = Array.from(this.el.querySelectorAll(deltaSelector)) as Array<HTMLElement>;
                this.horizontalScroll.addSlideDeltaValuesToElements([group]);
            }

        })

    }


    public prev():void {
        this.horizontalScroll && this.horizontalScroll.prev();
    }


    public next():void {
        this.horizontalScroll && this.horizontalScroll.next();
    }


    public isFirstSlide() {
        return this.horizontalScroll && this.horizontalScroll.isFirstSlide();
    }

    public isLastSlide() {
        return this.horizontalScroll && this.horizontalScroll.isLastSlide();
    }

    public dispose():void {
        this.horizontalScroll && this.horizontalScroll.dispose();
    }
}

