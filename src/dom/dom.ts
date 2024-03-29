import * as mathf from '../mathf/mathf';
import {Defer} from '../func/defer';
import * as func from '../func/func';
import * as is from '../is/is';
import {DomWatcher} from '../dom/dom-watcher';

/**
 * Given an element, returns the amount that the element has been scrolled
 * through in the the window.
 *
 * Example:
 * This method is particularly useful when you have a 100vh sticky element
 * and want a relative distance travelled percentage.
 *
 * ```
 * HTML
 * <div class="parent">
 *    <div class="child"><div class="content"></div>
 * </div>
 *
 * SASS
 * .parent
 *   position: relative
 *   height: 300vh  // Should be more than 100vh
 * .child
 *   position: sticky
 *   height: 100vh
 *   width: 100%
 *   top: 0
 * .contents
 *   position: relative
 *   height: 100vh
 *
 * JS
 *
 *  window.addEventListener('scroll', () => {
 *     let progress =
 *             dom.getElementScrolledPercent(this.stickyParent_);
 *     // 0 when the above the element,
 *     // increases as you scroll thorugh
 *     // 1 when the bottom of the element reaches the bottom of the screen.
 *     console.log(progress);
 *   });
 *
 *
 * ```
 *
 * Top and bottom offset.
 * You can offset the top and bottom so that the calculations are shifted.
 *
 * ```ts
 *
 *     let startOffset = 100;
 *     // Now progress will start when the element is 100px inview.
 *     // But still will complete normally at the bottom.
 *     let progress =
 *             mathf.getElementScrolledPercent(this.element, startOffset, 0);
 *
 *     let startOffset = window.innerHeight;
 *     // Now progress when the top of the element hits the top of the screen.
 *     // But still will complete normally at the bottom.
 *     let progress =
 *             mathf.getElementScrolledPercent(this.element, startOffset, 0);
 *
 *     let heightOffset = -100;
 *     // Entry as normal - 0 when the element first comes into view.
 *     // Now progress will complete get to 0 when there is still 100px
 *     // of the element still to be shown since it is virtually 100px shorter.
 *     let progress =
 *             mathf.getElementScrolledPercent(this.element, 0, heightOffset);
 *
 *     // Now progress will complete when the element has scrolled past
 *     // the center of the screen since we virually extend the height by
 *     // 50vh.
 *     let heightOffset = window.innerHeight * 0.5;
 *     let progress =
 *             mathf.getElementScrolledPercent(this.element, 0, heightOffset);
 *
 *     // Now progress will complete when the element has scrolled past
 *     // the very top of the screen.
 *     let heightOffset = window.innerHeight * 1;
 *     let progress =
 *             mathf.getElementScrolledPercent(this.element, 0, heightOffset);
 *
 * ```
 *
 * Provided the element is larger than the viewport height,
 * this will return 0% when the element is above the screen,
 * it increases in value as the user scrolls through the element and
 * finally when the BOTTOM of the element just passes the bottom of the screen
 * it returns 1.
 *
 * This method assumes that the tracked element is atleast more than 100vh.
 *
 * @param {HTMLElement} element The root element.
 * @param {number} startOffset A positive value (pixel) to offset the top position
 *     of the element.
 *     The start offset value should never be negative as technically, offseting
 *     to before the element comes into view doesn't have an effect and will
 *     only complicate things for you.
 *     Changing this value will affect the poitn at which your progress hits
 *     0 (starts).
 * @param {number} heightOffset A value (pixel) to add to the total height of
 *     the element.  Can be positive or negative values.  Think of this,
 *     shortening or growing your element virually.  Changing this value
 *     will affect the point at which your progress hits 1 (ends).
 * @param {boolean} Optionally remove percent clamping.  This means it can return
 *     values outside 0-1.
 * @param {number} Optionally pass the window.innerHeight value.  This is
 *    useful for cases in which you have cached the window.innerHeight value.
 *    One usecase for this is on mobile, the window.innerHeight value can change
 *    as the user scrolls (since the url bar appears and disappears). To avoid
 *    jumps in the return progress percent, you want to cache the
 *    window.innerHeight value and pass it here.
 * @return {number} percent The amount in percentage that the user has scrolled
 *     in the element.
 *
 */
export function getElementScrolledPercent(
  element: HTMLElement,
  startOffset = 0,
  heightOffset = 0,
  noClamp = false,
  innerHeight = 0
): number {
  const box = element.getBoundingClientRect();
  let wh;

  if (innerHeight) {
    wh = innerHeight;
  } else {
    wh = window.innerHeight;
  }

  // We need to calculate this so that we start the 0% when the element comes
  // in (the top of the element).  But the 100% is marked when the BOTTOM
  // of the element passes the bottom of the screen.
  const current = wh - (box.top + startOffset);
  const percent = current / (box.height - startOffset + heightOffset);
  return noClamp ? percent : mathf.clampAsPercent(percent);
}

/**
 * Given a rootElement and targetElement, returns the progress value of the
 * targetElement.
 *
 * The baseLine is a number that is from 0 to 1.  0 is the top of the element,
 * 0.5 would be the middle and 1 would be the bottom of the element.
 *
 * @see cssParallaxer.getElementProgressPoint for an in detail usecase of this
 * method.
 */
export function getElementProgressPoint(
  rootElement: HTMLElement,
  targetElement: HTMLElement,
  baseline = 0,
  startOffset = 0,
  heightOffset = 0,
  noClamp = false
): number {
  const y =
    Math.abs(
      rootElement.getBoundingClientRect().top -
        (targetElement.getBoundingClientRect().top +
          targetElement.offsetHeight * baseline)
    ) - startOffset;

  const totalScrollDistance = Math.abs(
    getScrollYAtPercent(rootElement, startOffset, heightOffset, 0, true) -
      getScrollYAtPercent(rootElement, startOffset, heightOffset, 1, true)
  );
  const percent = y / totalScrollDistance;
  return noClamp ? percent : mathf.clampAsPercent(percent);
}

/**
 * Inverse of getElementScrolledPercent.
 * Given an element on the page, finds the scrollY value in order
 * to scroll into that element by the provided percent.
 *
 * @param element
 * @param startOffset
 * @param heightOffset
 * @param percent A value between 0-1
 *
 * ```ts
 *
 * // Scroll halfway into the given element.
 * const scrollY = mathf.getScrollYAtPercent(element, 0, 0, 0.5);
 * window.scrollTo(0, scrollY);
 *
 * // Scroll 0.2 percent into the given element.
 * const scrollY = mathf.getScrollYAtPercent(element, 0, 0, 0.2);
 * window.scrollTo(0, scrollY);
 * ```
 */
export function getScrollYAtPercent(
  element: HTMLElement,
  startOffset = 0,
  heightOffset = 0,
  percent: number,
  withTransform = true
) {
  const wh = window.innerHeight;
  const top = withTransform
    ? getScrollTop(element)
    : getScrollTopWithoutTransforms(element);
  const start = top - wh + startOffset;
  const end = top - wh + element.offsetHeight + heightOffset;
  return mathf.lerp(start, end, percent);
}

/**
 * Sets a css variable to an element.
 *
 * ```ts
 *   dom.setCssVariable(
 *       myElement, '--chapter-height', '100px');
 * ```
 *
 * @param element The element to set the css variable.
 * @param name The name of the css variable.  Should start with --.  Exampe: --height
 * @param value The value to set.
 */
export function setCssVariable(
  element: HTMLElement,
  name: string,
  value: string | number
) {
  if (!element) {
    throw new Error(
      'You need specificy a valid element to apply a css variable'
    );
  }
  element.style.setProperty(name, String(value));
}

/**
 * Batch update css variables on an element.  This updates style in a
 * destructive manner and will override any other style elements.
 *
 * ```ts
 * dom.addVariables(element, { '--height': "200px", '--mycssvariable': '20px'});
 * ```
 * @param element
 * @param style
 */
export function setCssVariables(
  element: HTMLElement,
  variables: Record<string, string | number>
) {
  for (const key in variables) {
    element.style.setProperty(key, String(variables[key]));
  }
}

/**
 * Given a set of styles, add it to an element.
 *
 * ```ts
 * dom.addStyles(element, { left: "200px", '--mycssvariable': '20px'});
 * ```
 * @param element
 * @param style
 */
export function addStyles(
  element: HTMLElement,
  styles: {[key: string]: string}
) {
  for (const key in styles) {
    if (key.startsWith('--')) {
      setCssVariable(element, key, styles[key]);
    }
  }
  Object.assign(element.style, styles);
}

/**
 * Tests whether a given element is a descendant of another elemenet.
 *
 * Examples:
 * ```ts
 *  var isChild = dom.testDescendant(
 *      document.getElementById('button'),
 *      document.querySelector('.article'));
 *
 * // Whether the active focused element is under the article container.
 *  var isFocused = dom.testDescendant(document.activeElement,
 *      document.querySelector('.article'));
 * ```
 *
 * @param element The child element
 * @param parentElement The possible parent element
 * @return Whether element is a descendant of the provided parent element.
 */
export function testDescendant(
  element: HTMLElement,
  parentElement: HTMLElement
): boolean {
  let currentNode = element.parentNode;
  while (currentNode) {
    if (currentNode === parentElement) {
      return true;
    }
    currentNode = currentNode.parentNode;
  }
  return false;
}

/**
 * Tests whether a given video element is playing.
 * @param videoElement
 */
export function testVideoIsPlaying(video: HTMLVideoElement): boolean {
  return !video.paused && !video.ended && video.readyState > 2;
}

/**
 * Resets all videos inside of a given element.
 * @param element The element to search videos in for.
 */
export function resetAllVideosInElement(element: HTMLElement) {
  const videos = Array.from(element.querySelectorAll('video'));
  videos.forEach(video => {
    video.currentTime = 0;
  });
}

/**
 * Pauses all videos inside of a given element.
 * @param element The element to search videos in for.
 * @param reset Whether to pause and reset the video to 0 seconds (start).
 */
export function pauseAllVideosInElement(element: HTMLElement, reset = false) {
  const videos = Array.from(element.querySelectorAll('video'));
  videos.forEach(video => {
    if (reset) {
      video.currentTime = 0;
    }
    video.pause();
  });
}

/**
 * Plays all videos inside of a given element.
 * @param element The element to search videos in for.
 * @param reset Whether to start playing from currentTime 0.
 */
export function playAllVideosInElement(element: HTMLElement, reset = false) {
  const videos = Array.from(element.querySelectorAll('video'));
  videos.forEach(video => {
    if (reset) {
      video.currentTime = 0;
    }
    if (!testVideoIsPlaying(video)) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {}).catch(() => {});
      }
    }
  });
}

/**
 * Allows you to make sure that all videos are loaded (readyState 4) in a
 * given element before executing callback.
 *
 * Note that this method executes polling in the background
 * to check for video state so use carefully.  Defaults to timeout after
 * 10000ms
 *
 * ```ts
 * // Wait for all videos to be loaded.
 * dom.whenVideosLoadedInElement(element).then(()=> {
 *   // Play all videos for example.
 *   dom.playAllVideosInElement(element);
 * })
 *
 * ```
 * @param element
 * @param timeout The amount of time in which to give up polling.
 * @return Promise
 */
export function whenVideosLoadedInElement(
  element: HTMLElement,
  timeout = 10000
): Promise<void> {
  const videos = Array.from(element.querySelectorAll('video'));
  return whenVideosLoaded(videos, timeout);
}

/**
 * Allows you to make sure that all videos are loaded (readyState 4)
 * before executing callback.
 *
 * Note that this method executes polling in the background
 * to check for video state so use carefully.  Defaults to timeout after
 * 10000ms
 *
 * ```ts
 * // Wait for all videos to be loaded.
 * const videos = [videoElement1, videoElement2];
 * dom.whenVideosLoaded(videos).then(()=> {
 *   //
 * })
 *
 * ```
 * @param element
 * @param timeout The amount of time in which to give up polling.
 * @return Promise
 */
export function whenVideosLoaded(
  videos: Array<HTMLVideoElement>,
  timeout = 10000
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const promises: Array<Promise<any>> = [];
  videos.forEach(video => {
    const defer = new Defer();
    promises.push(defer.getPromise());
    func
      .waitUntil(() => video.readyState === 4, timeout, 10)
      .then(() => {
        defer.resolve();
      });
  });

  return Promise.all(promises);
}

/**
 * Fires a event on the element.
 *
 * ```ts
 * dom.event(document, 'myCustomEvent', { message: hello});
 *
 * // Data gets passed on the event.detail.
 * document.addEventListener('myCustomEvent', (e)=> {
 *   console.log(e.detail.message); // Hello
 * }, false)
 * ```
 *
 * @param element
 * @param name
 * @param data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function event(element: HTMLElement, name: string, data: any) {
  const event = new CustomEvent(name, {detail: data});
  element.dispatchEvent(event);
}

/**
 * Creates an html element from a string.
 * ```
 * dom.createElementFromString("<div>Hohohoho</div>");
 * ```
 * @param htmlString
 * @param fragMethod Uses a method to create dom from string WITHOUT using innerHTML
 */
export function createElementFromString(
  htmlString: string,
  fragMethod = false
): HTMLElement {
  if (fragMethod) {
    const holder = document.createElement('div') as HTMLElement;
    const frag = document.createRange().createContextualFragment(htmlString);
    holder.appendChild(frag);
    return holder.firstElementChild as HTMLElement;
  } else {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    return div.firstChild as HTMLElement;
  }
}

/**
 * Removes an element from the dom.
 * @param element
 */
export function removeElement(element: HTMLElement) {
  element.parentNode!.removeChild(element);
}

/**
 * Removes all children of a given element.  This can be prefereable over
 * `element.innerHTML = ''` since that does not remove listeners.
 */
export function removeAllChildren(element: HTMLElement) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Executes a callback after window has loaded.
 * This isn't a simple window load event listening but
 * first makes a check if the window has already loaded.
 * If it has, the callback will immediately get executed,
 * otherwise, it will wait until the load event completes.
 * @param callback
 */
export function runAfterWindowLoad(callback: Function) {
  // Make sure we are at the bottom of the event
  // stack (hence setTimeout) - this avoids
  // edge cases in which windowLoaded is misevaluated.
  window.setTimeout(() => {
    if (is.windowLoaded()) {
      callback();
    } else {
      window.addEventListener(
        'load',
        () => {
          callback();
        },
        {once: true}
      );
    }
  });
}

/**
 * Executes a callback as soon as the user is not at the top of the screen.
 *
 * If the user is at the top of the screen when this is called, it will
 * wait until the user has scrolled down to execute.  If the user is already
 * not at the top of the screen, the callback will immediately execute.
 *
 * Note that if your document is less than 100vh, your callback will
 * never get executed because the user can't scroll and will always be at
 * the top of the screen.
 *
 * @param callback
 */
export function runAfterNotTopOfScreen(callback: Function) {
  if (window.scrollY !== 0) {
    callback();
  } else {
    window.addEventListener(
      'scroll',
      () => {
        callback();
      },
      {once: true, passive: true}
    );
  }
}

/**
 * Gets the current browser aspect ratio.
 * 2 --> wide rectangle
 * 1 --> squre
 * 0.5 --> tall rectangle
 */
export function aspect() {
  return window.innerWidth / window.innerHeight;
}

/**
 * Gets the computed style of a given element .
 * @param element
 * @return CSSStyleDeclartion
 */
export function getComputedStyle(element: HTMLElement): CSSStyleDeclaration {
  return window.getComputedStyle(element);
}

/**
 * Creates an image in memory that is later deletable so it can
 * be released from native memory AND image cache.
 *
 * This method can be paired with deleteImage.
 *
 * // Consider the following:
 * new Image();
 * image.src = 'hohoho.jpg';
 * image.decode().then(()=> {
 *   // Do something.
 *   myCanvas.drawImage(image);
 *   image = null;
 * })
 *
 * This does appear to get GCed and removed from image cache but it is
 * never flushed from native memory.
 *
 * You can observe this by going to Chrome -> Task manager.  Make sure
 * you have the Memory and also the Image Cache columns.
 *
 * Theefore, usage of image.decode() for now, can lead to memory leaks that
 * can't be cured with image=null.
 *
 * The same is observed with ImageBitmaps.
 *
 * Related.
 * https://bugs.webkit.org/show_bug.cgi?id=31253
 *
 *
 * The solution is to use createObjectURL and later revoke that
 * so memory can be released.
 *
 * ```
 * const imageSource = 'public/image/cat.jpg';
 *
 * // Cache the image in browser memory.
 *    dom.fetchAndMakeImage(imageSource).then((image)=> {
 *
 *       // Do something with image.
 *       myCanvas.drawImage(image);
 *
 *       // Delete from memory.
 *       dom.deleteImage(image);
 *    })
 *
 * ```
 */
export function fetchAndMakeImage(source: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    fetch(source)
      .then(response => {
        return response.blob();
      })
      .then(response => {
        const blob = response;
        const img = document.createElement('img');
        img.decoding = 'async';
        img.onload = () => {
          resolve(img);
        };
        img.src = URL.createObjectURL(blob);
      });
  });
}

/**
 * Makes images from a blob source.  Can be coupled with
 * delete image to quickly release memory.
 * @param blob
 */
export function makeImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    const img = document.createElement('img');
    img.decoding = 'async';
    img.onload = () => {
      img.onload = null;
      resolve(img);
    };
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Makes an image from a blob source.  This is an alternative to
 * URL.createObjectURL is to convert a Blob into a base64-encoded string.
 *
 *
 * Return somethig like:
 * <img src="data:image/png;base64,R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAA">
 *
 * @param blob
 */
export function makeBase64ImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(blob); // converts the blob to base64 and calls onload

    reader.addEventListener(
      'load',
      () => {
        const img = document.createElement('img');
        img.src = reader.result as string;
        img.onload = () => {
          img.onload = null;
          resolve(img);
        };
      },
      {once: true}
    );
  });
}

export function copyBase64Image(
  image: HTMLImageElement
): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    const img = document.createElement('img');
    img.src = image.src;
    img.onload = () => {
      img.onload = null;
      resolve(img);
    };
  });
}

/**
 * Deletes an image from memory.  Inverse action of
 * dom.makeBase64ImageFromBlob or dom.makeImageFromBlob.
 */
export function deleteImage(image: HTMLImageElement | null) {
  if (image) {
    // Delete ObjectURLs or base64
    if (
      image.src &&
      (image.src.startsWith('blob:') || image.src.startsWith('data:'))
    ) {
      URL.revokeObjectURL(image.src);
      image.src = '';
    }
    image = null;
  }
}

/**
 * Flushes all video sources in a given element.  This allow the VRAM to
 * flush.  Use unflushVideos to put it back.
 *
 * This is particularly useful to combine with inview.
 * Where normally, it would take Chrome a couple of seconds
 * to flush memory of an outview video, this would do it
 * explicitly release memory much quicker.
 *
 *
 * Current will only work with video with <source> not video with
 * src.
 * ```
 *  <video>
 *    <source src="xxx.mp4"></source>
 *    <source src="xxx.webm"></source>
 * </video>
 * ```
 *
 * Basically, this works by removig the src attribute from each video
 * and then force reloading it - flushing it from memory.
 *
 * ```ts
 *    let ev = elementVisibility.inview(
 *       el, {rootMargin: '100px 100px 100px 100px'}, () => {
 *       if (ev.state().ready) {
 *         if (ev.state().inview) {
 *           dom.unflushVideos(el);
 *         } else {
 *           dom.flushVideos(el);
 *         }
 *       }
 *     });
 *
 * ```
 *
 *
 * You may also have a case where you are lazyloading videos as such:
 *
 * ```
 * <video>
 *    <source lazyvideo-src="xxx.mp4"></source>
 * </video>
 * ```
 *
 * In this case, you can use the source attribute to specify the data-attritube
 * that contains the path to the source.
 *
 * ```ts
 *     dom.flushVideos(el, 'lazyvideo-src');
 * ```
 *
 * https://html.spec.whatwg.org/multipage/media.html#best-practices-for-authors-using-media-elements
 *
 * @param el The html element to search
 * @param sourceAttribute An optional attribute value to acquire the
 *   video source from.
 */
export function flushVideos(el: HTMLElement, sourceAttribute = '') {
  const videos = Array.from(el.querySelectorAll('video'));
  videos.forEach(video => {
    const sources = Array.from(video.querySelectorAll('source'));
    sources.forEach((source: HTMLSourceElement | null) => {
      const src = source!.getAttribute(sourceAttribute) || source!.src;
      source!.setAttribute('data-video-src', src);
      source!.removeAttribute('src');
      source = null;
    });

    video.load();
  });
}

/**
 * Puts back video sources and undoes the effect of dom.flushVideos.
 * @param el The root element.
 * @param noPlay Whether to suppress autoplaying of videos when videos are
 *   unflushed.
 */
export function unflushVideos(el: HTMLElement, noPlay = false) {
  const videos = Array.from(el.querySelectorAll('video'));
  videos.forEach(video => {
    const sources = Array.from(video.querySelectorAll('source'));
    sources.forEach(source => {
      if (!source.hasAttribute('data-video-src')) {
        return;
      }
      const src = source.getAttribute('data-video-src')!;
      source.setAttribute('src', src);
    });

    video.load();
  });

  if (!noPlay) {
    playAllVideosInElement(el);
  }
}

/**
 * Gets the Y distance of the element from the top of the document.
 *
 * ```ts
 *   const top = dom.getScrollTop(el);
 *   window.scroll(0, top);
 * ```
 *
 */
export function getScrollTop(el: HTMLElement, includeParent = false): number {
  // Safe guard.
  if (!el) {
    return 0;
  }

  if (includeParent && el.offsetParent) {
    return (
      el.getBoundingClientRect().top -
      el.offsetParent.getBoundingClientRect().top +
      window.scrollY
    );
  } else {
    return el.getBoundingClientRect().top + window.scrollY;
  }
}

/**
 * Gets the Y distance of the element from the top of the document without
 * regard to any transforms applied.
 *
 * ```ts
 *   const top = dom.getScrollTopWithoutTransforms(el);
 *   window.scroll(0, top);
 * ```
 *
 */
export function getScrollTopWithoutTransforms(el: HTMLElement): number {
  let offsetTop = 0;
  do {
    offsetTop += el.offsetTop;
    el = el.offsetParent as HTMLElement;
  } while (el);
  return offsetTop;
}

/**
 * An attempt at override VO focus.
 * Requires the element to have a tabindex="-1" and then focusing.
 * To fully reinstante the original state prior to running force focus,
 * run resetForceFocus().
 *
 *
 * ---
 *
 * dom.forceFocus(myElement);
 *
 * window.setTimeout(()=> {
 *
 *   dom.forceFocus(myElement2);
 *
 * }, 2000)
 *
 *
 *
 * //  Some given time later, undo everything if needed.
 * dom.resetForceFocus();
 * ---
 */
export function forceFocus(el: HTMLElement) {
  // Check if we previously forced focused element in which case,
  // revert that to it's previously state.
  resetForceFocus();

  const currentIndex = el.getAttribute('tabindex');
  if (is.defined(currentIndex) && !is.nullLike(currentIndex)) {
    el.setAttribute('forcetabindex', currentIndex!);
  } else {
    el.setAttribute('forcetabindex', 'none');
  }

  el.setAttribute('tabindex', '-1');
  el.focus();
}

/**
 * Undos the effects of forceFocus which overrides the tabindex of focused
 * elements.
 */
export function resetForceFocus() {
  const previouslyFocusedElement = Array.from(
    document.querySelectorAll('[forcetabindex]')
  );
  previouslyFocusedElement.forEach(element => {
    const tabIndex = element.getAttribute('forcetabindex');
    if (is.defined(tabIndex) && !is.nullLike(tabIndex) && tabIndex !== 'none') {
      element.setAttribute('tabindex', tabIndex!);
    } else {
      element.removeAttribute('tabindex');
    }
    element.removeAttribute('forcetabindex');
  });
}

/**
 * Apart from .forceFocus, another alternative workaround for
 * implementing forces VO focus.
 * Thank you to: https://silvantroxler.ch/2016/setting-voiceover-focus-with-javascript/
 * @param el
 */
export function forceVOFocus(
  element: HTMLElement,
  interval = 10,
  repetition = 10
) {
  const focusInterval = interval; // ms, time between function calls
  const focusTotalRepetitions = repetition; // number of repetitions

  element.setAttribute('tabindex', '0');
  element.blur();

  let focusRepetitions = 0;
  const int = window.setInterval(() => {
    element.focus();
    focusRepetitions++;
    if (focusRepetitions >= focusTotalRepetitions) {
      window.clearInterval(int);
    }
  }, focusInterval);
}

/**
 * Returns a list of focusable child elements from a parent element.
 */
export function getFocusableElements(element: HTMLElement): HTMLElement[] {
  return Array.from(
    element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  );
}

/**
 * Gets all focusable elements within an element and sets it to the given tabindex.
 * This method is paired with "unsetFocusableElementsToTabIndex" to undo this
 * action.
 *
 * ```
 * # Set all focusable elements to -1 tabindex.
 *   dom.setFocusableElementsToTabIndex(parentElement, -1);
 *
 * # Later undo this effect.  Focusable elements revert to their original tab index.
 *   dom.unsetFocusableElementsToTabIndex(parentElement);
 * ```
 */
export function setFocusableElementsToTabIndex(
  element: HTMLElement,
  tabindex: number
) {
  const elements: HTMLElement[] = getFocusableElements(element);
  elements.forEach(element => {
    const currentTabIndex = element.tabIndex;
    if (!element.hasAttribute('originalTabIndex')) {
      element.setAttribute('originalTabIndex', currentTabIndex + '');
    }
    element.tabIndex = tabindex;
  });
}

/**
 * Reverts all focusable elements within an element to its original tabindex
 * after the 'dom.setFocusableElementsToTabIndex()` method has been executed.
 */
export function unsetFocusableElementsToTabIndex(element: HTMLElement) {
  const elements: HTMLElement[] = Array.from(
    element.querySelectorAll('[originalTabIndex]')
  );

  elements.forEach(element => {
    const originalTabIndex: string =
      element.getAttribute('originalTabIndex') || '';
    element.tabIndex = +originalTabIndex;
  });
}

/**
 * Gets the current styles on a given element.
 *
 * ```
 * var style = dom.getStyle(el);
 *
 * style.marginTop;
 * style.paddingLeft;
 *
 * ```
 */
export function getStyle(el: Element): CSSStyleDeclaration {
  return window.getComputedStyle(el);
}

/**
 * Tests whether the provided element is set to display none.
 */
export function isDisplayNone(el: Element): boolean {
  const style = window.getComputedStyle(el).display;
  return style === 'none';
}

/**
 * Tests whether a given element and it's ancestors have
 * a display:none.  This is useful to see if a given element
 * is on the screen (based on whether if the element or it's ancestors have
 * display none.)
 *
 * ```
 * const elementIsVisibleOnScreen = !dom.isDisplayNoneWithAncestors(element);
 * ```
 */
export function isDisplayNoneWithAncestors(el: Element): boolean {
  if (isDisplayNone(el)) {
    return true;
  }
  if (el.parentElement) {
    return isDisplayNoneWithAncestors(el.parentElement);
  }
  return false;
}

/**
 * Tries to determine if the element is currently visible on the
 * screen.  Note this is an attempt and is not a guarantee as is based
 * on whether the element or its parents have opacity, visibility or
 * display set to a hidden state.
 * @param el
 */
export function isVisibleOnScreen(el: HTMLElement): boolean {
  const checkVisibility = (el: HTMLElement): boolean => {
    const styles = getComputedStyle(el as HTMLElement);
    return !(
      styles.opacity !== '1' ||
      styles.visibility === 'hidden' ||
      styles.display === 'none'
    );
  };

  const isVisible = checkVisibility(el);
  if (!isVisible) {
    return false;
  }
  if (el.parentElement) {
    return isVisibleOnScreen(el.parentElement);
  }
  return true;
}

/**
 * Removes all classes from an element that starts with a given prefix.
 * https://stackoverflow.com/questions/28608587/how-to-remove-a-class-that-starts-with
 * @param el
 * @param prefix
 */
export function removeClassByPrefix(el: HTMLElement, prefix: string) {
  const reg = new RegExp('\\b' + prefix + '.*?\\b', 'g');
  el.className = el.className.replace(reg, '');
  return el;
}

/**
 * Returns all text nodes under a given element.
 * https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page
 * @param el
 */
export function getAllTextNodes(el: HTMLElement): Array<Node> {
  let n;
  const a = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while ((n = walk.nextNode())) a.push(n);
  return a;
}

export function appendAfter(
  nodeToAdd: HTMLElement,
  nodeToAddAfter: HTMLElement
) {
  nodeToAddAfter.parentNode!.insertBefore(
    nodeToAdd,
    nodeToAddAfter.nextSibling
  );
}

/**
 * Used for cases in which you want to prevent scroll on the page.
 *
 * Technically, this prevents wheel and touchmove events.
 *
 * ```
 * // Disable scrolling.
 * const reenable = dom.domDisableScrolling();
 *
 * // Renable.
 * reenable();
 * ```
 */
export function disableScrolling() {
  const disabler = (e: Event) => {
    e.preventDefault();
  };

  const domWatcher = new DomWatcher();
  domWatcher.add({
    element: window,
    on: 'wheel',
    callback: disabler,
    eventOptions: {
      passive: false,
    },
  });
  domWatcher.add({
    element: window,
    on: 'touchmove',
    callback: disabler,
    eventOptions: {
      passive: false,
    },
  });

  return () => {
    domWatcher.dispose();
  };
}

/**
 * Adds &nbsps to between the second to last and last word
 * to avoid unorphanization.
 *
 * ```
 *       // Unorphanize all text nodes.
 *       dom.unorphan(element as HTMLElement);
 *
 *       // No nesting (just the last text node)
 *       dom.unorphan(element as HTMLElement, true);
 * ```
 * @param el
 */
export function unorphan(el: HTMLElement, lastOnly = false): void {
  let allTextNodes = getAllTextNodes(el as HTMLElement);
  if (lastOnly) {
    allTextNodes = [allTextNodes[allTextNodes.length - 1]];
  }

  const nbsp = '\xA0';
  allTextNodes.forEach(node => {
    node.nodeValue = node.nodeValue!.replace(/\s+([^\s]*)\s*$/, nbsp + '$1');
  });
}

export function getScrollElement(): Element {
  return document.scrollingElement || document.documentElement;
}

/**
 * Determines if two elements are overlapping or not.
 * @param aElement
 * @param bElement
 * https://stackoverflow.com/questions/12066870/how-to-check-if-an-element-is-overlapping-other-elements
 */
export function isOverlapping(
  aElement: HTMLElement,
  bElement: HTMLElement
): boolean {
  // Element Can't overlap with itself.
  if (aElement === bElement) {
    return false;
  }

  const rect1 = aElement.getBoundingClientRect();
  const rect2 = bElement.getBoundingClientRect();
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

/**
 * Adds the given cssStyle to the page.
 * @param cssStyle
 *
 * ```
 * dom.addStylesToPage(".myclass { background: blue}");
 * ```
 */
export function addStylesToPage(cssStyle: string) {
  document.head.insertAdjacentHTML('beforeend', `<style>${cssStyle}</style>`);
}

/**
 * https://stackoverflow.com/questions/54520554/custom-element-getrootnode-closest-function-crossing-multiple-parent-shadowd
 *
 * Looks for the closest element that matches the selector across the shadow DOM
 * and standard DOM boundaries.
 *
 * ```
 * dom.addStylesToPage(".my-shadow-dom-parent", element);
 * ```
 */
export function closestElementComposed(selector, baseElement) {
  function closestFrom(baseElement) {
    if (!baseElement || baseElement === document || baseElement === window)
      return null;
    const found = baseElement.closest(selector);
    return found ? found : closestFrom(baseElement.getRootNode().host);
  }
  return closestFrom(baseElement);
}

/**
 * Finds all loading="lazy" within an element and removes the attribute.
 * The context and reason why you may want to use this is because of how
 * native lazy loading works.  Native lazy image loading will only load an image
 * when it is rendered and painted on the screen.  Say you have
 * a carousel module with many slides.  Even if the user has scrolled into
 * the module, carousel image in slides 2,3 etc with lazy loading will
 * not load until the user clicks into that slide and the image is painted.
 *
 * To avoid this, you can run this when the module comes into view.
 */
export function removeNativeLazyImage(rootElement: HTMLElement) {
  const lazyElements: HTMLElement[] = Array.from(
    rootElement.querySelectorAll('[loading=lazy]')
  );

  lazyElements.forEach(element => {
    element.removeAttribute('loading');
  });
}

/**
 * Listens for a specified event on any element within the provided element and
 * then recursively calls the listener on all ancestors of the originating
 * element.
 *
 * For example a given module,  when any click event happens within the module,
 * call your listener repeatedly starting from the originating element and all
 * of its ancestors (bubble up) up to the document root.
 *
 * ```ts
 *   dom.addDelegatedListener(
 *     myModuleElement || document.documentElement,
 *     'click',
 *     (e: HTMLElement, event: any) => {
 *       if (!e) {
 *         return;
 *       }
 *        // Called on the element that was clicked and it's parent
 *        // recursively until the document root.
 *        ...
 *     }
 *   );
 * ```
 *
 * @param {Element} el Element to host the listener.
 * @param {string} type Listener type.
 * @param {function} listener Listener function.
 */
export function addDelegatedListener(
  el: HTMLElement,
  type: string,
  listener: Function
) {
  const handler = (e: any) => {
    e = e || window.event;
    let target = e.target || e.srcElement;
    target = target.nodeType === 3 ? target.parentNode : target;
    do {
      listener(target, e);
      if (target.parentNode) {
        target = target.parentNode;
      }
    } while (target.parentNode);
  };
  el.addEventListener(type, handler);

  // Return a function to remove the listener.
  return () => {
    el.removeEventListener(type, handler);
  };
}
