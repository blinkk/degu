/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A utility function that generally tests the state of things.
 */
export class is {
  /**
   * Helper function to do true type checking.
   * See https://gomakethings.com/true-type-checking-with-vanilla-js/
   * @param value
   * @param type
   */
  static type(value: any, type: String): boolean {
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
  static boolean(value: any): boolean {
    return is.type(value, 'boolean');
  }

  /**
   * @param value
   * @tested
   */
  static array(value: any): boolean {
    return is.type(value, 'array');
  }

  /**
   * @param value
   * @tested
   */
  static string(value: any): boolean {
    return is.type(value, 'string');
  }

  /**
   * @param value
   * @tested
   */
  static date(value: any) {
    return is.type(value, 'date');
  }

  /**
   * @param value
   * @tested
   */
  static number(value: any): boolean {
    return is.type(value, 'number');
  }

  /**
   * @param value
   * @tested
   */
  static function(value: any): boolean {
    return is.type(value, 'function');
  }

  /**
   * @param value
   * @tested
   */
  static null(value: any): boolean {
    return is.type(value, 'null');
  }

  /**
   * @param value
   * @tested
   */
  static undefined(value: any): boolean {
    return is.type(value, 'undefined');
  }

  /**
   * @param value
   * @tested
   */
  static defined(value: any): boolean {
    return !is.undefined(value);
  }

  /**
   * @param value
   * @tested
   */
  static regex(value: any): boolean {
    return is.type(value, 'regexp');
  }

  /**
   * @param value
   * @tested
   */
  static object(value: any): boolean {
    return is.type(value, 'object');
  }

  /**
   * @param value
   * @tested
   */
  static int(value: any): boolean {
    return is.number(value) && value % 1 === 0;
  }

  /**
   * @param value
   * @tested
   */
  static float(value: any): boolean {
    return is.number(value) && !is.int(value);
  }

  /**
   * @param value
   * @tested
   */
  static multipleOf(value: any, multiple: number): boolean {
    return is.number(value) && value % multiple === 0;
  }

  /**
   * @param value
   * @tested
   */
  static powerOf2(value: number): boolean {
    return value !== 0 && (value & (value - 1)) === 0;
  }

  /**
   * @param value
   * @tested
   */
  static even(value: any): boolean {
    return is.number(value) && is.multipleOf(value, 2);
  }

  /**
   * @param value
   * @tested
   */
  static odd(value: any): boolean {
    return is.number(value) && !is.even(value);
  }

  /**
   * https://stackoverflow.com/questions/2652319/how-do-you-check-that-a-number-is-nan-in-javascript
   * @param value
   * @tested
   */
  static nan(value: any): boolean {
    return value !== value;
  }

  static mobile(): boolean {
    return is.ios() || is.android();
  }

  static ios(): boolean {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent) || is.ipad();
  }

  static android(): boolean {
    return /Android/i.test(navigator.userAgent);
  }

  static chrome(): boolean {
    return navigator.userAgent.indexOf('Chrome') !== -1 && !is.edge();
  }

  static safari(): boolean {
    return (
      !is.chrome() && navigator.userAgent.indexOf('Safari') !== -1 && !is.edge()
    );
  }

  static ipad(): boolean {
    return (
      navigator.userAgent.toLowerCase().indexOf('macintosh') !== -1 &&
      Boolean(navigator.maxTouchPoints) &&
      navigator.maxTouchPoints > 2
    );
  }

  static edge(): boolean {
    return navigator.userAgent.indexOf('Edge') !== -1;
  }

  static firefox(): boolean {
    return navigator.userAgent.indexOf('Firefox') !== -1;
  }

  static ie(): boolean {
    return /MSIE\/\d+/.test(navigator.userAgent);
  }

  static ieOrEdge(): boolean {
    return (
      /Edge\/\d+/.test(navigator.userAgent) ||
      /MSIE\/\d+/.test(navigator.userAgent) ||
      /Trident\/\d+/.test(navigator.userAgent)
    );
  }

  static chromeOs(): boolean {
    return /\bCrOS\b/.test(navigator.userAgent);
  }

  /**
   * Detects support for offscreen canvas.
   * https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
   */
  static supportingOffScreenCanvas(): boolean {
    return !!window['OffscreenCanvas'];
  }

  /**
   * Detects support for webp images
   */
  static supportingWebp(): boolean {
    const elem = document.createElement('canvas');
    let canvasSupported = false;
    if (elem.toDataURL('image/webp')) {
      canvasSupported =
        elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    // Test for firefox fails in the above but as of version 65 FF
    // supports webp.
    if (is.firefox() && +navigator.userAgent.match(/Firefox\/(.*)/)![1] >= 65) {
      canvasSupported = true;
    }

    // Test for Edge fails above but as of version 18, Edge supports
    // webp.
    if (is.edge() && +navigator.userAgent.match(/Edge\/(.*)/)![1] >= 18) {
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
  static supportingWebpAsync(): Promise<boolean> {
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
  static supportingAdvancedCssCalc(): boolean {
    document.body.style.transitionTimingFunction =
      'cubic-bezier(calc(1 * 1),1,1,1)';
    return getComputedStyle(document.body).transitionTimingFunction !== 'ease';
  }

  /**
   * Whether touch is supported or not.
   */
  static supportingTouch(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }

  /**
   * Whether device orientation is supported
   */
  static supportingDeviceOrientation(): boolean {
    return !!window['DeviceOrientationEvent'] as any;
  }

  /**
   * Whether FILE Apis are supported.
   */
  static supportingFileApis(): boolean {
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
  static supportingCreateImageBitmap(): boolean {
    return (!!window['createImageBitmap'] as any) && !is.firefox();
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
  static cssHex(value: any): boolean {
    return is.string(value) && value.startsWith('#');
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
  static cssRgba(value: any) {
    return is.string(value) && value.startsWith('rgba(');
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
  static cssRgb(value: any) {
    return is.string(value) && value.startsWith('rgb(');
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
  static hex(value: any): boolean {
    const a = parseInt(value, 16);
    return is.string(value) && a.toString(16) === value.toLowerCase();
  }

  /**
   * Whether if the window load event has fired.
   * @see https://stackoverflow.com/questions/13364613/how-to-know-if-window-load-event-was-fired-already
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming/loadEventEnd
   */
  static windowLoaded(): boolean {
    return performance.timing.loadEventEnd !== 0;
  }

  /**
   * Whether this URL looks like a google cloudish url.
   * @param url
   */
  static isGoogleCloudLikeUrl(url: string): boolean {
    return url.includes('googleusercontent.com');
  }

  /**
   * Whether the current viewport is landscape or not.   Includes 1x1 aspect.
   */
  static isLandscape(): boolean {
    return window.innerWidth >= window.innerHeight;
  }

  // Alias
  static landscape(): boolean {
    return window.innerWidth < window.innerHeight;
  }

  /**
   * Whether the current viewport is portrait or not.   Excludes 1x1 aspect.
   */
  static isPortrait(): boolean {
    return window.innerWidth < window.innerHeight;
  }

  // Alias
  static portrait(): boolean {
    return window.innerWidth < window.innerHeight;
  }

  /**
   * Whether this is one of the major search engine bots.
   * https://stackoverflow.com/questions/20084513/detect-search-crawlers-via-javascript
   */
  static bot(): boolean {
    const botPattern =
      '(googlebot/|bot|Googlebot-Mobile|Googlebot-Image|Google favicon|Mediapartners-Google|bingbot|slurp|java|wget|curl|Commons-HttpClient|Python-urllib|libwww|httpunit|nutch|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|biglotron|teoma|convera|seekbot|gigablast|exabot|ngbot|ia_archiver|GingerCrawler|webmon |httrack|webcrawler|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|IOI|ips-agent|tagoobot|MJ12bot|dotbot|woriobot|yanga|buzzbot|mlbot|yandexbot|purebot|Linguee Bot|Voyager|CyberPatrol|voilabot|baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|dotbot|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|ahrefsbot|Aboundex|domaincrawler|wbsearchbot|summify|ccbot|edisterbot|seznambot|ec2linkfinder|gslfbot|aihitbot|intelium_bot|facebookexternalhit|yeti|RetrevoPageAnalyzer|lb-spider|sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|seokicks-robot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|blexbot|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|Lipperhey SEO Service|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Livelapbot|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|Twitterbot|OrangeBot|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|SemrushBot|yoozBot|lipperhey|y!j-asr|Domain Re-Animator Bot|AddThis)';
    const re = new RegExp(botPattern, 'i');
    return re.test(navigator.userAgent);
  }
}
/* eslint-enable */
