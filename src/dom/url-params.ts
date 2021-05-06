import { objectf } from '../objectf/objectf';

/**
 * Utility classes for url manipulation.
 */
export class urlParams {

    /**
     * Whether two string urls are of the same original
     */
    static areSameHostNames(url1:string, url2:string) {
        var urlA = new URL(url1);
        var urlB = new URL(url2);
        return urlA.hostname == urlB.hostname;
    }


    /**
     * Checks if a given param is present in the url AND is set to 'true'
     *
     * ```
     * urlParams.isTrue('sup');
     *
     * // http://mydomain.com?sup=true --> true
     * // http://mydomain.com?hello&sup=true  --> true
     *
     * // http://mydomain.com --> false
     * // http://mydomain.com?sup --> false
     * // http://mydomain.com?sup=false --> false
     * ```
     */
    static isTrue(paramName: string): boolean {
        let param = window.location.search.split(paramName + '=')[1];
        param = param && param.split('&')[0];
        return param == 'true';
    }

    /**
     * Checks if a given param is present in the url AND is set to 'true'
     *
     * ```
     * urlParams.getValue('sup');
     *
     * // http://mydomain.com/?sup=hello --> hello
     * // http://mydomain.com/?hello&sup=hello  --> hello
     *
     * // http://mydomain.com --> null
     * // http://mydomain.com/?sup --> null
     *
     *
     * // For quick sanitization.
     * const myvalue = stringf.alphaNumeric(urlParams.getValue('sup'));
     * ```
     */
    static getValue(paramName: string): string | null {
        let param = window.location.search.split(paramName + '=')[1];
        param = param && param.split('&')[0];
        return param || null;
    }


    /**
     * Tests if the given param is in the url.
     * @param paramName
     */
    static hasParam(paramName: string): boolean {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has(paramName);
    }


    /**
     * Updates the current URL params with the provided value.
     * Uses history.replaceState.
     *
     * ```
     * // http://mydomain.com/mypage/
     * urlParams.addParamNow('name', 'Scott');
     * // http://mydomain.com/mypage/?name=Scott
     * ```
     */
    static addParamNow(paramName: string, value: string) {
        var url = new URL(window.location.href);
        url.searchParams.set(paramName, value);
        if (window.history.replaceState) {
            window.history.replaceState({}, '', url.toString());
        }
    }



    /**
     * Updates the current URL params and removes a parameter.
     * Uses history.replaceState.
     *
     * ```
     * // http://mydomain.com/mypage/?name=Scott
     * urlParams.removeParam('name');
     * // http://mydomain.com/mypage/
     * ```
     */
    static removeParamNow(paramName: string) {
        var url = new URL(window.location.href);
        url.searchParams.delete(paramName);
        if (window.history.replaceState) {
            window.history.replaceState({}, '', url.toString());
        }
    }



    /**
     * Allows you to loop through each url param.
     *
     * ```
     * Given: mydomain.com?name=scott&location=mars
     *
     * const params = urlParams.asObject(window.location.search);
     *
     * console.log(params); // { name: "scott", location: "mars"}
     *
     * ```
     * @param callback
     */
    static asObject(url: string): Record<string, string> {
        const query = url.substr(1);
        let result: Record<string, string> = {};
        query.split("&").forEach((section: any) => {
            let item = section.split("=");

            if (item[0] == "") {
                return;
            }

            result[item[0]] = decodeURIComponent(item[1]);
        });

        return result;
    }



    /**
     * Appends the current url params to the href values of a list
     * of anchor elements.
     *
     *
     * ```
     *   urlParams.appendUrlParamsToLinks(
     *     Array.from(document.querySelectorAll('a'))
     *   )
     *
     *  // Blacklist / Prevent specific url params from gettings carried over to links.
     *   urlParams.appendUrlParamsToLinks(
     *     Array.from(document.querySelectorAll('a')),
     *     [ 'modal', 'email']
     *   )
     *
     *  // Whitelist specific url params.
     *   urlParams.appendUrlParamsToLinks(
     *     Array.from(document.querySelectorAll('a')),
     *     null,
     *     ['gtm']
     *   )
     * ```
     * @param elements
     */
    static appendUrlParamsToLinks(
        elements: Array<HTMLAnchorElement>,
        blackListKeys: Array<string> = [],
        whiteListKeys: Array<string> = [],
    ) {
        if ('URLSearchParams' in window) {
            const params = urlParams.asObject(window.location.search);
            elements.forEach((el: HTMLAnchorElement) => {

                // Don't process for links with href.
                if (!el.href) {
                    return;
                }

                let url = new URL(el.href);
                objectf.forEach(params, (key: string, value: string) => {
                    if (!url.searchParams.has(key)) {
                        if (whiteListKeys && whiteListKeys.length >= 1) {
                            if (~whiteListKeys.indexOf(key)) {
                                url.searchParams.append(key, value);
                            }
                        } else {
                            if (blackListKeys && blackListKeys.length >= 1) {
                                if (!~blackListKeys.indexOf(key)) {
                                    url.searchParams.append(key, value);
                                }
                            } else {
                                url.searchParams.append(key, value);
                            }
                        }
                    }
                })
                el.href = url.toString();
            })
        }
    }



    /**
     * Adds a hisotry push state with hash.  Use with removeUrlHistoryHash.
     *
     * ```
     * // Update the URL hash with #test.
     * open() {
     *      urlParams.addHistoryHash('modal', 'test');
     *      window.addEventListener('popstate', this.close.bind(this), { once: true});
     * }
     *
     * // Removes the hash and pop state.
     * close() {
     *      urlParams.removeHistoryHash('modal');
     * }
     *
     * ```
     */
    static addHistoryHash(name: string, value: string) {
        window.history.pushState({ name: value }, '', '#' + value);
    }

    /**
     * Removes a previously set popstate url hash.
     */
    static removeHistoryHash(name: string) {
        window.history.pushState({name: null}, '', window.location.pathname);
    }


    /**
     * Extracts the hostname from a given url.
     * @param url
     */
    static getHostName(url:string) {
       var hostname = (new URL(url)).hostname;
       return hostname;
    }


    /**
     * Checks whether if the last page the user was on, was on this current site.
     */
    static lastPageWasSameHost() {
        return (document.referrer &&
             urlParams.getHostName(document.referrer) ==
             urlParams.getHostName(window.location.href));
    }



    /**
     * Updates a particular URL param value.
     * This internally, updates window.location.search
     * value.
     *
     * ```
     * // Immediately update the url search params.
     * window.location.search =
     *  urlParams.updateUrlParam('myparam', 'true').toString();
     *
     * // Update multiple
     * const params = new URLSearchParams(window.location.search);
     * params = urlParams.updateUrlParam('hello', 'true', params);
     * params = urlParams.updateUrlParam('name', 'scott', params);
     * params = urlParams.updateUrlParam('favFood', 'mikan', params);
     * // Update
     * window.location.search = params.toString();
     *
     * ```
     */
    static updateSearchParams(param:string, value:string, urlSearchParams?: URLSearchParams): URLSearchParams {
        if(!urlSearchParams) {
            urlSearchParams = new URLSearchParams(window.location.search);
        }

        urlSearchParams.set(param, value);
        return urlSearchParams;
    }

}
