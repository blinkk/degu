/**
 * Helper function to do true type checking.
 * See https://gomakethings.com/true-type-checking-with-vanilla-js/
 * @param value
 * @param type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function type(value: any, type: String): boolean {
  const trueType = Object.prototype.toString
    .call(value)
    .slice(8, -1)
    .toLowerCase();
  return type === trueType;
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function boolean(value: any): boolean {
  return type(value, 'boolean');
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function array(value: any): boolean {
  return type(value, 'array');
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function string(value: any): boolean {
  return type(value, 'string');
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function date(value: any) {
  return type(value, 'date');
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function number(value: any): boolean {
  return type(value, 'number');
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function functionLike(value: any): boolean {
  return type(value, 'function');
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function nullLike(value: any): boolean {
  return type(value, 'null');
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function undefinedLike(value: any): boolean {
  return type(value, 'undefined');
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defined(value: any): boolean {
  return !undefinedLike(value);
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function regex(value: any): boolean {
  return type(value, 'regexp');
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function object(value: any): boolean {
  return type(value, 'object');
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function int(value: any): boolean {
  return number(value) && value % 1 === 0;
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function float(value: any): boolean {
  return number(value) && !int(value);
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function multipleOf(value: any, multiple: number): boolean {
  return number(value) && value % multiple === 0;
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function powerOf2(value: number): boolean {
  return value !== 0 && (value & (value - 1)) === 0;
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function even(value: any): boolean {
  return number(value) && multipleOf(value, 2);
}

/**
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function odd(value: any): boolean {
  return number(value) && !even(value);
}

/**
 * https://stackoverflow.com/questions/2652319/how-do-you-check-that-a-number-is-nan-in-javascript
 * @param value
 * @tested
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function nan(value: any): boolean {
  return value !== value;
}

export function mobile(): boolean {
  return ios() || android();
}

export function ios(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) || ipad();
}

export function android(): boolean {
  return /Android/i.test(navigator.userAgent);
}

export function chrome(): boolean {
  return navigator.userAgent.indexOf('Chrome') !== -1 && !edge();
}

export function safari(): boolean {
  return !chrome() && navigator.userAgent.indexOf('Safari') !== -1 && !edge();
}

export function ipad(): boolean {
  return (
    navigator.userAgent.toLowerCase().indexOf('macintosh') !== -1 &&
    Boolean(navigator.maxTouchPoints) &&
    navigator.maxTouchPoints > 2
  );
}

export function edge(): boolean {
  return navigator.userAgent.indexOf('Edge') !== -1;
}

export function firefox(): boolean {
  return navigator.userAgent.indexOf('Firefox') !== -1;
}

export function ie(): boolean {
  return /MSIE\/\d+/.test(navigator.userAgent);
}

export function ieOrEdge(): boolean {
  return (
    /Edge\/\d+/.test(navigator.userAgent) ||
    /MSIE\/\d+/.test(navigator.userAgent) ||
    /Trident\/\d+/.test(navigator.userAgent)
  );
}

export function chromeOs(): boolean {
  return /\bCrOS\b/.test(navigator.userAgent);
}

/**
 * Detects support for offscreen canvas.
 * https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
 */
export function supportingOffScreenCanvas(): boolean {
  return !!window['OffscreenCanvas'];
}

/**
 * Detects support for webp images
 */
export function supportingWebp(): boolean {
  const elem = document.createElement('canvas');
  let canvasSupported = false;
  if (elem.toDataURL('image/webp')) {
    canvasSupported =
      elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  // Test for firefox fails in the above but as of version 65 FF
  // supports webp.
  if (firefox() && +navigator.userAgent.match(/Firefox\/(.*)/)![1] >= 65) {
    canvasSupported = true;
  }

  // Test for Edge fails above but as of version 18, Edge supports
  // webp.
  if (edge() && +navigator.userAgent.match(/Edge\/(.*)/)![1] >= 18) {
    canvasSupported = true;
  }

  return canvasSupported;
}

/**
 * The is.supportWebp has some performance costs due to the use of toDataUrl.
 * This allows you to avoid that.
 *
 * Note that technically it is async but it is going to resolve almost
 * instantly.
 *
 * ```
 * is.supportingWebpAsync().then((supports)=> {
 *    if(supports) {
 *      ...supported
 *    }
 * });
 *
 * ```
 */
export function supportingWebpAsync(): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = function () {
      const result = img.width > 0 && img.height > 0;
      resolve(result);
    };
    img.onerror = () => {
      resolve(false);
    };
    img.src =
      'data:image/webp;base64,' +
      'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });
}

/**
 * Whether the browser can handle more advanced css calc.
 * @see https://css-tricks.com/making-custom-properties-css-variables-dynamic/
 */
export function supportingAdvancedCssCalc(): boolean {
  document.body.style.transitionTimingFunction =
    'cubic-bezier(calc(1 * 1),1,1,1)';
  return getComputedStyle(document.body).transitionTimingFunction !== 'ease';
}

/**
 * Whether touch is supported or not.
 */
export function supportingTouch(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Whether device orientation is supported
 */
export function supportingDeviceOrientation(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!window['DeviceOrientationEvent'] as any;
}

/**
 * Whether FILE Apis are supported.
 */
export function supportingFileApis(): boolean {
  return !!(
    window['File'] &&
    window['FileReader'] &&
    window['FileList'] &&
    window['Blob']
  );
}

/**
 * Whether createImageBitMap is supported or not.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap;
 */
export function supportingCreateImageBitmap(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (!!window['createImageBitmap'] as any) && !firefox();
}

/**
 * A string value that appears to be a css hex.
 *
 * ```
 * is.cssHex('#FFFFFF') // true
 * is.cssHex('#ffffff') // true
 * is.cssHex('FFFFFF') // false
 * is.cssHex(0) // false
 *
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cssHex(value: any): boolean {
  return string(value) && value.startsWith('#');
}

/**
 * A string value that appears to be a css rgba like.
 *
 * ```
 * is.cssRgba("rgba(255, 255, 255, 0.3)") // true
 * is.cssRgba("rgba()") // true
 * is.cssRgba('rgb('255, 255, 255)') // false
 *
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cssRgba(value: any) {
  return string(value) && value.startsWith('rgba(');
}

/**
 * A string value that appears to be a css rgb like.
 *
 * ```
 * is.cssRgb("rgb(255, 255, 255)") // true
 * is.cssRgb("rgba(')") // false
 * is.cssRgb(90) // false
 *
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cssRgb(value: any) {
  return string(value) && value.startsWith('rgb(');
}

/**
 * Tests whether this is a hex value.
 * ```
 * is.hex('#FFFFFF') // false -> starts with #.
 * is.hex('FFFFFF') // true
 * is.hex('ffffff') // true
 * is.hex(0) // false
 *
 * ```
 * @param value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hex(value: any): boolean {
  const a = parseInt(value, 16);
  return string(value) && a.toString(16) === value.toLowerCase();
}

/**
 * Whether if the window load event has fired.
 * @see https://stackoverflow.com/questions/13364613/how-to-know-if-window-load-event-was-fired-already
 * @see https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming/loadEventEnd
 */
export function windowLoaded(): boolean {
  return performance.timing.loadEventEnd !== 0;
}

/**
 * Whether this URL looks like a google cloudish url.
 * @param url
 */
export function isGoogleCloudLikeUrl(url: string): boolean {
  return url.includes('googleusercontent.com');
}

/**
 * Whether the current viewport is landscape or not.   Includes 1x1 aspect.
 */
export function isLandscape(): boolean {
  return window.innerWidth >= window.innerHeight;
}

// Alias
export function landscape(): boolean {
  return window.innerWidth < window.innerHeight;
}

/**
 * Whether the current viewport is portrait or not.   Excludes 1x1 aspect.
 */
export function isPortrait(): boolean {
  return window.innerWidth < window.innerHeight;
}

// Alias
export function portrait(): boolean {
  return window.innerWidth < window.innerHeight;
}

/**
 * Whether this is one of the major search engine bots.
 * https://stackoverflow.com/questions/20084513/detect-search-crawlers-via-javascript
 */
export function bot(): boolean {
  const botPattern =
    '(googlebot/|bot|Googlebot-Mobile|Googlebot-Image|Google favicon|Mediapartners-Google|bingbot|slurp|java|wget|curl|Commons-HttpClient|Python-urllib|libwww|httpunit|nutch|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|biglotron|teoma|convera|seekbot|gigablast|exabot|ngbot|ia_archiver|GingerCrawler|webmon |httrack|webcrawler|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|IOI|ips-agent|tagoobot|MJ12bot|dotbot|woriobot|yanga|buzzbot|mlbot|yandexbot|purebot|Linguee Bot|Voyager|CyberPatrol|voilabot|baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|dotbot|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|ahrefsbot|Aboundex|domaincrawler|wbsearchbot|summify|ccbot|edisterbot|seznambot|ec2linkfinder|gslfbot|aihitbot|intelium_bot|facebookexternalhit|yeti|RetrevoPageAnalyzer|lb-spider|sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|seokicks-robot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|blexbot|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|Lipperhey SEO Service|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Livelapbot|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|Twitterbot|OrangeBot|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|SemrushBot|yoozBot|lipperhey|y!j-asr|Domain Re-Animator Bot|AddThis)';
  const re = new RegExp(botPattern, 'i');
  return re.test(navigator.userAgent);
}

/**
 * A utility function that generally tests the state of things.
 */
export const is = {
  android,
  array,
  boolean,
  bot,
  chrome,
  chromeOs,
  cssHex,
  cssRgb,
  cssRgba,
  date,
  defined,
  edge,
  even,
  firefox,
  float,
  functionLike,
  function: functionLike,
  hex,
  ie,
  ieOrEdge,
  int,
  ios,
  ipad,
  isGoogleCloudLikeUrl,
  landscape,
  portrait,
  isLandscape: landscape,
  mobile,
  multipleOf,
  nan,
  nullLike,
  null: nullLike,
  number,
  object,
  odd,
  isPortrait: portrait,
  powerOf2,
  regex,
  safari,
  string,
  supportingAdvancedCssCalc,
  supportingCreateImageBitmap,
  supportingDeviceOrientation,
  supportingFileApis,
  supportingOffScreenCanvas,
  supportingTouch,
  supportingWebp,
  supportingWebpAsync,
  type,
  undefined: undefinedLike,
  windowLoaded,
};
