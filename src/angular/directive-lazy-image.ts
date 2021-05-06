import { DomWatcher } from '../dom/dom-watcher';
import { dom } from '../dom/dom';
import { is } from '../is/is';
import { elementVisibility, ElementVisibilityObject } from '../dom/element-visibility';
import { INgDisposable } from './i-ng-disposable';
import { func } from '../func/func';
import { Raf } from '../raf/raf';

export class LazyImage implements INgDisposable {
    static get $inject() {
        return ['$scope', '$element', '$attrs'];
    }

    private el: HTMLElement | HTMLImageElement;
    // The url to set.
    private url: string;
    // Whether this directive has finished setting the background image.
    private imageSet: boolean;
    private setAsBackgroundImage: boolean;
    private watcher: DomWatcher | null = null;
    private ev: ElementVisibilityObject | null = null;
    private readWrite: Raf;

    // The amount of rootMargin offset to apply to lazyimage.
    // 1 would result in a forward load of 1 * window.innerHeight.
    // 0 would mean no forward load.
    // Defaults to 1.
    // Set to higher values if you want to load more images that are below
    // the current fold.
    private forwardLoadScalar: number;


    // Whether the current browser environment supports webp.
    private isWebpSupported: boolean = false;

    // Whether we should try to append 'rw' to the url to serve webp.
    private useGoogleImageTryWebp: boolean;
    // Whether we should tyr to add width parameters to the google image.
    private useGoogleImageAutosize: boolean;


    // Whether to swap the images for webp (when in non google image mode).
    private shouldSwapForWebp: boolean = false;

    private parentLoadedSelector: string;

    private googleImageMultiplier: number = 1;

    // Allows you to specificy a different element as the lazy image trigger.
    // The image will load when this element is inview.  The trigger selector
    // will pick the closest match to the element.
    private triggerElementSelector: string;

    // The root element that triggers lazy load when it's inview.  This is usually
    // the element that has the lazy-image attribute but can be modified if
    // triggerElementSelector is specified.
    private triggerElement: HTMLElement | null = null;


    private waitForBgLoad: boolean = false;



    constructor($scope: ng.IScope, $element: ng.IAugmentedJQuery, $attrs: ng.IAttributes) {
        this.el = $element[0];
        this.url = $attrs.lazyImage;
        this.readWrite = new Raf();
        this.setAsBackgroundImage = !!$attrs.lazyImageAsBackground;
        this.forwardLoadScalar =
            is.defined($attrs.lazyImageForwardLoadScalar) ?
                +$attrs.lazyImageForwardLoadScalar : 1;

        this.useGoogleImageAutosize = $attrs.lazyImageGoogleImageAutosize == 'true';
        this.useGoogleImageTryWebp = $attrs.lazyImageGoogleImageTryWebp == 'true';
        this.googleImageMultiplier = +$attrs.lazyImageGoogleImageMultiplier || 1;
        this.shouldSwapForWebp = $attrs.lazyImageSwapForWebp == 'true' || false;
        this.parentLoadedSelector = $attrs.lazyImageLoadedSelector || false;
        this.triggerElementSelector = $attrs.lazyImageTriggerElementSelector || false;

        this.waitForBgLoad = $attrs.lazyImageWaitForBgLoad == 'true' || false;


        this.imageSet = false;

        // Cache this value since is.supportingWebp can be computationally expensive.
        is.supportingWebpAsync().then((supporting) => {
            this.isWebpSupported = supporting;

            this.watcher = new DomWatcher();
            this.watcher.add({
                element: window,
                on: 'smartResize',
                callback: func.debounce(this.resize.bind(this), 500),
                eventOptions: {
                    passive: true
                }
            });


            if(this.triggerElementSelector) {
                this.triggerElement = this.el.closest(this.triggerElementSelector) as HTMLElement;
                if(!this.triggerElement) {
                    this.triggerElement = this.el;
                }
            } else {
                this.triggerElement = this.el;
            }


            this.ev = elementVisibility.inview(this.triggerElement, {
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
        this.readWrite.read(() => {
            if (this.isPaintedOnScreen() && !this.imageSet && this.ev!.state().inview) {
                this.startLoad();
            }
        })
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
        // browser, we want to resize the loaded image.
        if (this.useGoogleImageAutosize) {

            const currentWidth = this.getWidthFromGoogleUrl(this.url);
            const newUrl = this.autosizeGoogleImage(this.url);
            const newWidth = this.getWidthFromGoogleUrl(newUrl);

            // There is no reason to reload or fetch another image, if the
            // new size is slated to be smaller than what is already loaded.
            if (currentWidth > newWidth) {
                return;
            }

            this.url = newUrl;

            this.readWrite.write(() => {
                if (this.setAsBackgroundImage) {
                    this.el.style.backgroundImage = `url(${this.url})`;
                } else {
                    this.el.setAttribute('src', this.url);
                }
            })
        }
    }



    private startLoad() {
        this.imageSet = true;

        // Get rid of watchers unless we need resize processing.
        if (!this.useGoogleImageAutosize) {
            this.watcher && this.watcher.dispose();
        }

        this.ev && this.ev.dispose();
        this.loadImage().then(() => {
            dom.event(this.el, 'lazy-image-loaded', {
                element: this.el
            });

            dom.event(document.documentElement, 'lazy-image-loaded', {
                element: this.el
            });
        })
    }



    loadImage(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.useGoogleImageTryWebp) {
                this.url = this.appendGoogleImageWebpParamToUrl(this.url);
            }
            if (this.useGoogleImageAutosize) {
                this.url = this.autosizeGoogleImage(this.url);
            }

            this.url = this.appendGoogleCachePolicy(this.url);

            if(this.shouldSwapForWebp) {
                this.url = this.swapForWebp(this.url);
            }

            let element = this.el;

            // If this is to be a background image.
            if (this.setAsBackgroundImage) {
                this.readWrite.write(() => {
                    if(this.waitForBgLoad) {
                        let imageLoader = new Image();
                        let onLoad = () => {
                            this.readWrite.write(() => {
                                this.el.style.backgroundImage = `url(${this.url})`;
                                this.el.classList.add('loaded')
                                const closestImageContainer = this.el.closest('.image-container');
                                closestImageContainer && closestImageContainer.classList.add('loaded');
                                if(this.parentLoadedSelector) {
                                const closestLoadedContainer = this.el.closest(this.parentLoadedSelector);
                                closestLoadedContainer && closestLoadedContainer.classList.add('loaded');
                                }
                                resolve();
                            });
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

                        imageLoader.src = this.url;
                    } else {
                            this.el.style.backgroundImage = `url(${this.url})`;
                            this.el.classList.add('loaded')
                            const closestImageContainer = this.el.closest('.image-container');
                            closestImageContainer && closestImageContainer.classList.add('loaded');
                            if(this.parentLoadedSelector) {
                              const closestLoadedContainer = this.el.closest(this.parentLoadedSelector);
                              closestLoadedContainer && closestLoadedContainer.classList.add('loaded');
                            }
                            resolve();

                    }

                })
                return;
            }

            // If this is a new image to be replaced.
            let imageLoader = new Image();
            let onLoad = () => {
                this.readWrite.write(() => {
                    // Add loaded class.
                    imageLoader.classList.add('loaded');
                    const closestImageContainer = this.el.closest('.image-container');
                    closestImageContainer && closestImageContainer.classList.add('loaded');

                    if(this.parentLoadedSelector) {
                      const closestLoadedContainer = this.el.closest(this.parentLoadedSelector);
                      closestLoadedContainer && closestLoadedContainer.classList.add('loaded');
                    }


                    // Swap out the div with the new image.
                    element.parentNode &&
                        element.parentNode.replaceChild(imageLoader, element);

                    this.el = imageLoader;
                    resolve();
                });
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


    /**
     * Given an image url, swaps the .jpg or .png extension for .webp if webp is
     * supported.
     * @param url
     */
    private swapForWebp(url:string) {
        if(this.isWebpSupported) {
            return url.replace('.jpg', '.webp').replace('.png', '.webp');
        } else {
            return url;
        }
    }

    private appendGoogleCachePolicy(url: string): string {
        if (!is.isGoogleCloudLikeUrl(url)) {
            return url;
        }
        return url + '-e365';
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
        let width = Math.ceil(this.el.offsetWidth * window.devicePixelRatio * this.googleImageMultiplier);


        // If the image size can't be determined, use the window width.
        if(width == 0) {
            width = Math.ceil(window.innerWidth * window.devicePixelRatio * this.googleImageMultiplier);
        }


        // // If a width can't be determined, give up and just serve the image.
        // if (!width) {
        //     return url;
        // }

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
     * Given a google url, extracts the width value.
     * @param url
     */
    private getWidthFromGoogleUrl(url: string): number {
        const match = url.match(/\w([0-9]+)$/);
        return match ? +match[1] : 0;
    }


    dispose() {
        this.ev && this.ev.dispose();
        this.watcher && this.watcher.dispose();
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
 * ## Webp support.
 * This is typically done for local server images.  For example if you have
 * an image that is xxx.jpg or xxx.png, setting this option to true
 * will swap the extention to .webp if webp is available.
 *
 * Note that if you are using Google Images, you shouldn't enable this and
 * instead use the google images support (below).
 * ```
 * lazy-image-swap-for-webp="true"
 * ```
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
 * # Autowidth Multiplier
 * For cases in which you want to intentionally load larger image, use the image multiplier
 * lazy-image-google-image-multiplier="1.2"
 *
 *
 * # Image container
 *
 * By convention, a parent of the image that has the class, image-container will automatically
 * recieve a "loaded" class when the image loads.  This is helpful in controlling animations
 * when the image itself loads.
 *
 * <div class="image-container">
 *   <div lazy-image="{{url}}" lazy-image-forward-load-scalar="0"></div>
 * </div>
 *
 * # You can also opt to add the loaded class given a selector.
 * For example, this would do a look up for add-inview on the parent of the lazy image
 * item.
 * lazy-image-loaded-selector="[add-inview]"
 *
 * # Visibility Element
 *
 * There are times when you want to trigger lazy image based on the visibility
 * of another element (often a parent).  You can do this by adding the
 * lazy-image-trigger-element-selector option.  Note that the logic for this
 * is to select the CLOSEST element with that selector.
 *
 *
 * For example:
 * ```
 *
 * <div class="image-container" lazy-image-trigger>
 *   <div lazy-image="{{url}}" lazy-image-forward-load-scalar="0"></div>
 * </div>
 *
 *
 * lazy-image-trigger-element-selector="[lazy-image-trigger]"
 *
 * ```
 *
 * Since the parent container has the lazy-image-trigger and is the closest,
 * this image will load when the image container is inview.
 *
 *
 *
 * ## Wait for Bg loading
 * Force bg loading in background.
 *
 * Normally when using lazy image as a background
 * image, we just set the style="url(...)" to trigger the image loading.
 *
 * However, setting this option will first preload the image in the background
 * and then set the style.  This *can* lead to confusing results because
 * if you have chrome dev tools open with 'disable cache' it almost appears
 * like the image loaded twice.
 *
 *
 * If testing bandwidth, use incognito mode.
 *
 * ```
 * lazy-image-wait-for-bg-load="true"
 * ```
 *
 */
export const lazyImageDirective = function () {
    return {
        restrict: 'A',
        controller: LazyImage,
    };
}

