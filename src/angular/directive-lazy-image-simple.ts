import { DomWatcher } from '../dom/dom-watcher';
import { dom } from '../dom/dom';
import { is } from '../is/is';
import { elementVisibility, ElementVisibilityObject } from '../dom/element-visibility';
import { INgDisposable } from './i-ng-disposable';

export class LazyImageSimple implements INgDisposable {
    static get $inject() {
        return ['$scope', '$element', '$attrs'];
    }

    private el: HTMLElement;
    // The url to set.
    private url: string;
    // Whether this directive has finished setting the background image.
    private imageSet: boolean;
    private setAsBackgroundImage: boolean;
    private watcher: DomWatcher;
    private ev: ElementVisibilityObject;

    // The amount of rootMargin offset to apply to lazyimage.
    // 1 would result in a forward load of 1 * window.innerHeight.
    // 0 would mean no forward load.
    // Defaults to 1.
    // Set to higher values if you want to load more images that are below
    // the current fold.
    private forwardLoadScalar: number;

    constructor($scope: ng.IScope, $element: ng.IAngularStatic, $attrs: ng.IAttributes) {
        this.el = $element[0];
        this.url = $attrs.lazyImageSimple;
        this.setAsBackgroundImage = !!$attrs.lazyImageSimpleAsBackground;
        this.forwardLoadScalar =
            is.defined($attrs.lazyImageForwardLoadScalar) ?
                +$attrs.lazyImageForwardLoadScalar : 1;
        this.imageSet = false;

        this.watcher = new DomWatcher();
        this.watcher.add({
            element: window,
            on: 'smartResize',
            callback: this.paint.bind(this)
        });

        this.ev = elementVisibility.inview(this.el, {
            rootMargin: window.innerHeight * this.forwardLoadScalar + 'px'
        }, () => {
            this.paint();
        });

        this.watcher.add({
            element: this.el,
            on: 'force-lazy-load',
            callback: () => {
                console.log('force lazy laodign');
                this.startLoad();
            }
        });

        $scope.$on('$destroy', () => {
            this.dispose();
        });
    }



    /**
     * Attemps to set the image if possible.
     */
    paint() {
        if (this.isPaintedOnScreen() && !this.imageSet && this.ev.state().inview) {
            this.startLoad();
        }
    }

    private startLoad() {
        this.imageSet = true;
        this.watcher.dispose();
        this.ev.dispose();
        this.loadImage().then(()=> {
            dom.event(document.documentElement, 'lazy-image-simple-loaded',  {
                element: this.el
            });
        })
    }

    loadImage() {
        return new Promise((resolve, reject) => {
            let element = this.el;

            // If this is to be a background image.
            if (this.setAsBackgroundImage) {
                this.el.style.backgroundImage = `url(${this.url})`;
                this.el.classList.add('loaded')
                resolve();
                return;
            }

            // If this is a new image to be replaced.
            let imageLoader = new Image();
            let onLoad = () => {
                // Add loaded class.
                imageLoader.classList.add('loaded');
                // Swap out the div with the new image.
                element.parentNode &&
                    element.parentNode.replaceChild(imageLoader, element);
                resolve();
            }

            imageLoader.addEventListener('load', onLoad, {
                once: true
            });

            let onError = (e: any) => {
                resolve();
            };
            imageLoader.addEventListener('error', onError, {
                once: true
            });

            let attributes = Array.prototype.slice.call(element.attributes).concat();
            // Transfer all attributes on the div to the new image.
            attributes.forEach((attr) => {
                imageLoader.setAttribute(attr.name, attr.value);
            })

            imageLoader.src = this.url;
        });

    }


    /**
     * Determines whether this element was painted (displayed on the screen).
     * The basis of this is having a css class of display none.  Other methods
     * of hiding the element will return true.
     */
    isPaintedOnScreen() {
        let style = window.getComputedStyle(this.el, null).display;
        return style != 'none';
    }


    dispose() {
        this.ev.dispose();
        this.watcher.dispose();
    }
}



/**
 * Allows loading of images only if the element or the child
 * is currently visible on the screen.  The basis of whether it is visible
 * is determined based on if the dislay is NOT set to none.
 *
 * Name your directive as lazyImageSimple.
 *
 *     ngApp.directive('lazyImageSimple', lazyImageSimpleDirective);
 *
 *
 * Now use it.
 * This will load the image:
 * <div lazy-image-simple="{{url}}"></div>
 *
 * After render will turn into:
 * <img src="{{url}}">
 *
 * This will load the image as a background image:
 * <div lazy-image-simple="{{url}}" lazy-image-simple-as-background="true"></div>
 *
 * After render will turn into:
 * <div style="backgroundImage: url({{url}})"></div>
 *
 * This will load only when on mobile.  The directive runs a test to see if the
 * directive element has display: none as a style.  If so, it will not run.
 * .only-mobile
 *   +md
 *     display: none
 *
 * <div lazy-image-simple="{{url}}" style="only-mobile"></div>
 *
 *
 * The directive lazy loads images.   By default, it will load 100vh below
 * the current fold.  You can adjust this value, by passing the lazyImageForwardLoadScalar.
 *
 * <div lazy-image-simple="{{url}}" lazy-image-foward-load-scalar="2"></div>
 * <div lazy-image-simple="{{url}}" lazy-image-foward-load-scalar="0"></div>
 */
export const lazyImageSimpleDirective = function () {
    return {
        restrict: 'A',
        controller: LazyImageSimple,
    };
}

