import { DomWatcher } from '../dom/dom-watcher';
import { dom } from '../dom/dom';
import { is } from '../is/is';
import { elementVisibility, ElementVisibilityObject } from '../dom/element-visibility';
import { INgDisposable } from './i-ng-disposable';
import { func } from '../func/func';

export class LazyImage implements INgDisposable {
    static get $inject() {
        return ['$scope', '$element', '$attrs'];
    }

    private el: HTMLElement;
    // The url to set.
    private url: string;
    // Whether this directive has finished setting the background image.
    private imageSet: boolean;
    private foucImage: HTMLImageElement;
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


    // Whether the current browser environment supports webp.
    private isWebpSupported: boolean;

    // Whether we should try to append 'rw' to the url to serve webp.
    private useGoogleImageTryWebp: boolean;
    // Whether we should tyr to add width parameters to the google image.
    private useGoogleImageAutosize: boolean;


    private foucWidth: number;
    private foucHeight: number;

    constructor($scope: ng.IScope, $element: ng.IAngularStatic, $attrs: ng.IAttributes) {
        this.el = $element[0];
        this.url = $attrs.lazyImage;
        this.setAsBackgroundImage = !!$attrs.lazyImageAsBackground;
        this.forwardLoadScalar =
            is.defined($attrs.lazyImageForwardLoadScalar) ?
                +$attrs.lazyImageForwardLoadScalar : 1;

        this.useGoogleImageAutosize = $attrs.lazyImageGoogleImageAutosize == 'true';
        this.useGoogleImageTryWebp = $attrs.lazyImageGoogleImageTryWebp == 'true';

        this.foucWidth = +$attrs.lazyImageFoucWidth || 0;
        this.foucHeight = +$attrs.lazyImageFoucHeight || 0;

        if(!!this.foucWidth && !!this.foucHeight) {
            this.setFoucImage();
        }

        if($attrs.lazyImageFoucDebug == 'true') {
          return;
        }

        this.imageSet = false;

        // Cache this value since is.supportingWebp can be computationally expensive.
        is.supportingWebpAsync().then((supporting)=> {
            this.isWebpSupported = supporting;

            this.watcher = new DomWatcher();
            this.watcher.add({
                element: window,
                on: 'smartResize',
                callback: func.debounce(this.resize.bind(this), 500)
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
                    this.startLoad();
                }
            });
        });


        $scope.$on('$destroy', () => {
            this.dispose();
        });
    }

    resize() {
        if (this.imageSet) {
            this.updateLoadedImage();
        } else {
            this.paint();
        }
    }



    /**
     * Attemps to set the image if possible.
     */
    paint() {
        if (this.isPaintedOnScreen() && !this.imageSet && this.ev.state().inview) {
            this.startLoad();
        }
    }

    /**
     * Handles redrawing / updating an image that has already been loaded.
     * This mainly gets called during window resize.
     */
    updateLoadedImage() {
        if (!this.imageSet) {
            return;
        }

        // If we have already set the google image but thereafter, resized the
        // browser, we want to resize the loaded imge.
        if (this.useGoogleImageAutosize) {
            this.url = this.autosizeGoogleImage(this.url);

            if (this.setAsBackgroundImage) {
                this.el.style.backgroundImage = `url(${this.url})`;
            } else {
                this.el['src'] = this.url;
            }
        }
    }



    private startLoad() {
        this.imageSet = true;

        // Get rid of watchers unless we need resize processing.
        if(!this.useGoogleImageAutosize) {
          this.watcher.dispose();
        }

        this.ev.dispose();
        this.loadImage().then(() => {
            dom.event(this.el, 'lazy-image-loaded', {
                element: this.el
            });

            dom.event(document.documentElement, 'lazy-image-loaded', {
                element: this.el
            });
        })
    }

    loadImage() {
        return new Promise((resolve, reject) => {
            if (this.useGoogleImageTryWebp) {
                this.url = this.appendGoogleImageWebpParamToUrl(this.url);
            }
            if (this.useGoogleImageAutosize) {
                this.url = this.autosizeGoogleImage(this.url);
            }

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

                this.el = imageLoader;
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
        // TODO (uxder): Possibly upgrade this to dom.isDisplayNoneWithAncestor.
        return !dom.isDisplayNone(this.el);
    }


    private appendGoogleImageWebpParamToUrl(url: string): string {
        if (!this.isWebpSupported || !is.isGoogleCloudLikeUrl(url)) {
            return url;
        }
        return url + '-rw';
    }

    private autosizeGoogleImage(url: string): string {
        if (!is.isGoogleCloudLikeUrl(url)) {
            return url;
        }

        // Get the width to use.
        let width = Math.ceil(this.el.offsetWidth * window.devicePixelRatio);


        // If a width can't be determined, give up and just serve the image.
        if (!width) {
            return url;
        }

        if (url.match(/\=w\d+/)) {
            url = url.replace(/=w\d+/, '=w' + width);
        } else if (url.match(/-w\d+/)) {
            url = url.replace(/-w\d+/, '-w' + width);
        } else {
            url += '-w' + width;
        }

        return url;
    }


    /**
     * Sets a FOUC image inside the root element.
     */
    private setFoucImage():void {
        this.foucImage = new Image();
        const width = this.foucWidth;
        const height = this.foucHeight;
        const src:string = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"%3E%3C/svg%3E`;
        this.foucImage.src = src;
        this.foucImage.classList.add('fouc-image');
        const offsetWidth = this.el.offsetWidth;
        let attributes = Array.prototype.slice.call(this.el.attributes).concat();
        // Transfer all attributes on the div to the new image.
        attributes.forEach((attr) => {
            if(attr.name.startsWith('lazy-image')) {
                return;
            }
            this.foucImage.setAttribute(attr.name, attr.value);
        })
        this.foucImage.style.width = !!offsetWidth ? offsetWidth + 'px' : '100%';
        this.el.append(this.foucImage);
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
 * Name your directive as lazyImage.
 *
 * ```
 *     ngApp.directive('lazyImage', lazyImageDirective);
 * ```
 *
 *
 * Now use it.
 *
 * This will load the image:
 * ```
 * <div lazy-image="{{url}}"></div>
 * ```
 *
 * After render will turn into:
 * ```
 * <img src="{{url}}">
 * ```
 *
 *
 * ## As background image
 * This will load the image as a background image:
 * <div lazy-image="{{url}}" lazy-image-as-background="true"></div>
 *
 * After render will turn into:
 *
 * ```
 * <div style="backgroundImage: url({{url}})"></div>
 * ```
 *
 * ## Conditional loading based on element visibility
 * This will load only when on mobile.  The directive runs a test to see if the
 * directive element has display: none as a style.  If so, it will not run.
 *
 * ```
 * .only-mobile
 *   +md
 *     display: none
 *
 * <div lazy-image="{{url}}" style="only-mobile"></div>
 * ```
 *
 *
 * ## Adjust lazyloading timing with forward-load-scalar
 * The directive lazy loads images.   By default, it will load 100vh below
 * the current fold.  You can adjust this value, by passing the lazyImageForwardLoadScalar.
 *
 * ```
 * <div lazy-image="{{url}}" lazy-image-forward-load-scalar="2"></div>
 *
 * // Zero means no foward load
 * <div lazy-image="{{url}}" lazy-image-forward-load-scalar="0"></div>
 * ```
 *
 *
 * ## Google Images support.
 * You can enable google images support.  The options are:
 * ```
 * lazy-image-google-image-try-webp="true"
 *    Lazy-image will append a -rw flag to the url if webp is supported.
 * lazy-image-google-image-autosize="true"
 *    Lazy-image will append a -wXXX (width) param based on the size of the current element
 * ```
 *
 *
 * ## FOUC guarding
 * Since image sizes are unknown until they are actually fetched, FOUC is an
 * issue with lazy loading images.
 *
 * This directive adds support to guard against by optionally adding a
 * base-64 svg image prior to actuallyl loading your image (only available).
 *
 * To use this, you'll want to set the following:
 *
 * ```
 * lazy-image-fouc-width="true"
 * lazy-image-fouc-height="true"
 * ```
 *
 * To debug fouc-image.  This will stop from the fouc-image to be replaced.
 * ```
 * lazy-image-fouc-debug="true"
 * ```
 *
 */
export const lazyImageDirective = function () {
    return {
        restrict: 'A',
        controller: LazyImage,
    };
}

