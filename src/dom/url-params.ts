
/**
 * Utility classes for url manipulation.
 */
export class urlParams {


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
    static isTrue(paramName:string):boolean {
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
     * // http://mydomain.com?sup=hello --> hello
     * // http://mydomain.com?hello&sup=hello  --> hello
     *
     * // http://mydomain.com --> null
     * // http://mydomain.com?sup --> null
     * ```
     */
    static getValue(paramName:string):string {
        let param = window.location.search.split(paramName + '=')[1];
        param = param && param.split('&')[0];
        return param || null;
    }

}